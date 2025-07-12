import { Request, Response, NextFunction, RequestHandler } from "express";
import express from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenants } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import tenantValidator from "../validators/tenant-validator";
import { CreateTenantRequest, TenantRequest } from "../types";
import listUsersValidator from "../validators/list-users-validator";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenants);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) => tenantController.create(req, res, next)
);

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        tenantController.update(req, res, next) as unknown as RequestHandler;
    }
);

router.get("/", listUsersValidator, (req: TenantRequest, res: Response, next: NextFunction) =>
    tenantController.getAll(req, res, next)
);

router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: TenantRequest, res: Response, next: NextFunction) => {
        tenantController.getOne(req, res, next) as unknown as RequestHandler;
    }
);

router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: TenantRequest, res: Response, next: NextFunction) => {
        tenantController.destroy(req, res, next) as unknown as RequestHandler;
    }
);

export default router;
