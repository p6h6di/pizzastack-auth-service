import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
    });

    describe.skip("Fields are missing", () => {
        it("should return", () => {});
    });
});
