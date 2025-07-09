import fs from "fs";
import path from "path";
import { NextFunction, Response } from "express";
import { RegisterRequestBody } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger
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

            let privateKey: Buffer;
            try {
                privateKey = fs.readFileSync(path.join(__dirname, "../../certs/private.pem"));
            } catch {
                const error = createHttpError(500, "Error reading private key");
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = sign(payload, privateKey, {
                algorithm: "RS256",
                expiresIn: "1h",
                issuer: "auth-service",
            });

            // persist refresh token in the database
            const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
            });

            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: "HS256",
                expiresIn: "1y",
                issuer: "auth-service",
                jwtid: String(newRefreshToken.id),
            });

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

            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
