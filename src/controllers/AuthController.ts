import { NextFunction, Response } from "express";
import { RegisterRequestBody } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService
    ) {}
    async register(req: RegisterRequestBody, res: Response, next: NextFunction) {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                res.status(400).json({ errors: result.array() });
                return;
            }

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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken = await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken(payload, newRefreshToken);

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            this.logger.info("User has been registered", {
                id: user.id,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req: RegisterRequestBody, res: Response, next: NextFunction) {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                res.status(400).json({ errors: result.array() });
                return;
            }

            const { email, password } = req.body;

            this.logger.debug("New request to login a user", {
                email,
                password: "*******", // Do not log passwords
            });

            // Check if user (email) exists
            const user = await this.userService.findByEmail(email);
            if (!user) {
                const error = createHttpError(400, "Email or password is incorrect");
                next(error);
                return;
            }

            // Check if password is correct
            const isPasswordValid = await this.credentialService.comparePasswords(
                password,
                user.password
            );
            if (!isPasswordValid) {
                const error = createHttpError(400, "Email or password is incorrect");
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken = await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken(payload, newRefreshToken);

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            this.logger.info("User has been logged in", {
                id: user.id,
            });
            res.json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
