import { Request, Response, NextFunction } from "express";
import express from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenants } from "../entity/Tenant";
import logger from "../config/logger";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenants);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post("/", (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next)
);

export default router;
