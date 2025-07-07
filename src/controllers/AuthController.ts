import { Response } from "express";
import { RegisterRequestBody } from "../types";
import { UserService } from "../services/UserService";

export class AuthController {
    userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }
    async register(req: RegisterRequestBody, res: Response) {
        const { firstName, lastName, email, password } = req.body;

        await this.userService.create({ email, firstName, lastName, password });
        res.status(201).json();
    }
}
