import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";

describe("POST /users", () => {
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
        it("should persist the user in the database", async () => {
            const adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send();

            const userRepository = connection.getRepository(User);
            const users = userRepository.find();

            expect([users]).toHaveLength(1);
        });

        it.todo("should return 403 if non admin user tries to create a user");
    });
});
