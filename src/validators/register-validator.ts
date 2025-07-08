import { body } from "express-validator";

export default [
    body("email").isEmail().notEmpty().withMessage("Email is required").normalizeEmail().trim(),
    body("firstName").notEmpty().withMessage("First name is required").trim(),
    body("lastName").notEmpty().withMessage("Last name is required").trim(),
    body("password").notEmpty().withMessage("Password is required").trim(),
];
