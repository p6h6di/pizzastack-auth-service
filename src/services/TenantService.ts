import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenants } from "../entity/Tenant";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenants>) {}
    async create(data: ITenant) {
        return await this.tenantRepository.save(data);
    }
}
