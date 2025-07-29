import { Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";

export class UserController {
    constructor(private userService: UserService) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const { email, firstName, lastName, password } = req.body;
        try {
            const user = await this.userService.create({
                email,
                firstName,
                lastName,
                password,
                role: Roles.MANAGER,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
