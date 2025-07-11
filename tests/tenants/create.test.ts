import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Tenants } from "../../src/entity/Tenant";

describe("POST /tenants", () => {
    let connection: DataSource;

    // make connection to the database before running the tests
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    // truncate the tables before running the tests
    beforeEach(async () => {
        if (connection) {
            await connection.dropDatabase();
            await connection.synchronize();
        }
    });

    // close the connection to the database after running the tests
    afterAll(async () => {
        if (connection) {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return a 201 status code", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const response = await request(app).post("/tenants").send(tenantData);

            expect(response.statusCode).toBe(201);
        });

        it("should create a tenant in database", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            await request(app).post("/tenants").send(tenantData);

            const tenantRepository = connection.getRepository(Tenants);
            const tenant = await tenantRepository.find();

            expect(tenant).toHaveLength(1);
            expect(tenant[0].name).toBe(tenantData.name);
            expect(tenant[0].address).toBe(tenantData.address);
        });
    });
});
