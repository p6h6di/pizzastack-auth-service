import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validators/login-validator";
import { CredentialService } from "../services/CredentialService";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(userService, logger, tokenService, credentialService);

router.post("/register", registerValidator, (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

router.post("/login", loginValidator, (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

router.get("/me", authenticate, (req: Request, res: Response) =>
    authController.me(req as AuthRequest, res)
);

router.post("/refresh", validateRefreshToken, (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next)
);

router.post(
    "/logout",
    authenticate,
    parseRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(req as AuthRequest, res, next)
);

export default router;
