import { Repository, Brackets } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ email, firstName, lastName, password, role }: UserData) {
        // Check if the user already exists
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (user) {
            const error = createHttpError(400, `User email already exists`);
            throw error;
        }

        // Hash the password before storing it
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user instance and save it to the database
        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            });

            return user;
        } catch (err) {
            const error = createHttpError(
                500,
                `Failed to store user in the database: ${err instanceof Error ? err.message : String(err)}`
            );
            throw error;
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }

    async findById(id: number) {
        return await this.userRepository.findOne({ where: { id } });
    }

    async update(userId: number, { firstName, lastName, role, email, tenantId }: LimitedUserData) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
                email,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
        } catch {
            const error = createHttpError(500, "Failed to update the user in the database");
            throw error;
        }
    }

    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder("user");

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
                        q: searchTerm,
                    }).orWhere("user.email ILike :q", { q: searchTerm });
                })
            );
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere("user.role = :role", {
                role: validatedQuery.role,
            });
        }

        const result = await queryBuilder
            .leftJoinAndSelect("user.tenant", "tenant")
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("user.id", "DESC")
            .getManyAndCount();
        return result;
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
