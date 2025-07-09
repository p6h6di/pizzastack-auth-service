import { body } from "express-validator";

export default [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Email should be a valid email")
        .notEmpty()
        .withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required").trim(),
];
