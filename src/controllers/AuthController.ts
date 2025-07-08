import { NextFunction, Response } from "express";
import { RegisterRequestBody } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger
    ) {}
    async register(req: RegisterRequestBody, res: Response, next: NextFunction) {
        try {
            const { firstName, lastName, email, password } = req.body;
            this.logger.debug("New user registration request", {
                firstName,
                lastName,
                email,
                password: "*******", // Do not log passwords
            });
            const user = await this.userService.create({ email, firstName, lastName, password });
            this.logger.info("User has been created", {
                id: user.id,
            });

            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
