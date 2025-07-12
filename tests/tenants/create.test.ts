import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Tenants } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /tenants", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

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
        it("should return a 201 status code", async () => {
            adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });

        it("should create a tenant in database", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenants);
            const tenant = await tenantRepository.find();

            expect(tenant).toHaveLength(1);
            expect(tenant[0].name).toBe(tenantData.name);
            expect(tenant[0].address).toBe(tenantData.address);
        });

        it("it should return 401 if user is not authenticated", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const response = await request(app).post("/tenants").send(tenantData);
            expect(response.statusCode).toBe(401);
            const tenantRepository = connection.getRepository(Tenants);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
        });

        it("it should return 403 if user is not admin", async () => {
            const managerToken = jwks.token({ sub: "1", role: Roles.MANAGER });

            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${managerToken};`])
                .send(tenantData);
            expect(response.statusCode).toBe(403);
            const tenantRepository = connection.getRepository(Tenants);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
        });
    });
});
