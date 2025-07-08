import { body } from "express-validator";

export default [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Email should be a valid email")
        .notEmpty()
        .withMessage("Email is required"),
    body("firstName").notEmpty().withMessage("First name is required").trim(),
    body("lastName").notEmpty().withMessage("Last name is required").trim(),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 6 characters long")
        .notEmpty()
        .withMessage("Password is required")
        .trim(),
];
