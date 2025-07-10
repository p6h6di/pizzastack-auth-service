import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/me", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    // make connection to the database before running the tests
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    // truncate the tables before running the tests
    beforeEach(async () => {
        jwks.start();
        if (connection) {
            await connection.dropDatabase();
            await connection.synchronize();
        }
    });

    afterEach(() => {
        jwks.stop();
    });

    // close the connection to the database after running the tests
    afterAll(async () => {
        if (connection) {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return the 200 status code", async () => {
            const accessToken = jwks.token({ sub: "1", role: Roles.CUSTOMER });
            const response = await request(app)
                .get("/auth/me")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it("should return the user data", async () => {
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: "shivamth060@gmail.com",
                password: "password123",
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            const accessToken = jwks.token({ sub: String(data.id), role: data.role });
            const response = await request(app)
                .get("/auth/me")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it("should not return the password field", async () => {
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: "shivamth060@gmail.com",
                password: "password123",
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            const accessToken = jwks.token({ sub: String(data.id), role: data.role });
            const response = await request(app)
                .get("/auth/me")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect(response.body as Record<string, string>).not.toHaveProperty("password");
        });
    });
});
