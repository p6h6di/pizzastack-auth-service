import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
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
            expect(user[0].password).not.toBe(userData.password);
        });

        it("should return the id of the created user", async () => {
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
            expect(response.body).toHaveProperty("id");
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect((response.body as Record<string, string>).id).toBe(users[0].id);
        });

        it("should assign a customer role to the user", async () => {
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
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it("should store the hashed password in the database", async () => {
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
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[ayb]\$.{56}$/);
        });

        it("should return 400 status code if email already exists", async () => {
            // Arrange
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: "shivamth060@gmail.com",
                password: "password123",
                role: Roles.CUSTOMER,
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save(userData);

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe("Fields are missing", () => {
        it("it should return 400 status code if email field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: "",
                password: "password123",
            };

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("it should return 400 status code if firstName field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "",
                lastName: "Thakur",
                email: "shivamth060@gmail.com",
                password: "password123",
            };

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("it should return 400 status code if lastName field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Shivam",
                lastName: "",
                email: "shivamth060@gmail.com",
                password: "password123",
            };

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("it should return 400 status code if password field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: "shivamth060@gmail.com",
                password: "",
            };

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe("Fields are not in correct format", () => {
        it("should trim the email field", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: " rakesh@mern.space ",
                password: "password",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            // const user = users[0];
            expect(users[0].email).toBe("rakesh@mern.space");
        });

        it("it should return 400 status code if email is not a valid email", async () => {
            // Arrange
            const userData = {
                firstName: "Shivam",
                lastName: "Thakur",
                email: " shivamth060com ",
                password: "password123",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("it should return 400 status code if password length is less than 8 chars", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "pass", // less than 8 chars
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("shoud return an array of error messages if email is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.body).toHaveProperty("errors");
            expect((response.body as Record<string, string>).errors.length).toBeGreaterThan(0);
        });
    });
});
