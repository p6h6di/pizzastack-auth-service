import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTables } from "../utils";

describe("POST /auth/register", () => {
    let connection: DataSource;

    // make connection to the database before running the tests
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    // truncate the tables before running the tests
    beforeEach(async () => {
        await truncateTables(connection);
    });

    // close the connection to the database after running the tests
    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return the 201 status code", async () => {
            // Arrange
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: "shivamth060@gmail.com",
                password: "password123",
            };

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            // Arrange
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: "shivamth060@gmail.com",
                password: "password123",
            };

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.headers["content-type"]).toMatch(/json/);
        });

        it("should persist the user in the database", async () => {
            // Arrange
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: "shivamth060@gmail.com",
                password: "password123",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();
            expect(user).toHaveLength(1);
            expect(user[0].firstName).toBe(userData.firstName);
            expect(user[0].lastName).toBe(userData.lastName);
            expect(user[0].email).toBe(userData.email);
            expect(user[0].password).toBe(userData.password);
        });
    });

    describe.skip("Fields are missing", () => {
        // it("", () => {});
    });
});
