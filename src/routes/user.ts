import { Request, Response, RequestHandler, NextFunction } from "express";
import express from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import listUsersValidator from "../validators/list-users-validator";
import updateUserValidator from "../validators/update-user-validator";
import logger from "../config/logger";
import { UpdateUserRequest, UserRequest } from "../types";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) => userController.create(req, res, next)
);

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (req: UpdateUserRequest, res: Response, next: NextFunction) => {
        userController.update(req, res, next).catch(next);
    }
);

router.get(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    listUsersValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next).catch(next)
);

router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: UserRequest, res: Response, next: NextFunction) =>
        userController.getOne(req, res, next).catch(next)
);

router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: UserRequest, res: Response, next: NextFunction) =>
        userController.destroy(req, res, next).catch(next)
);

export default router;
