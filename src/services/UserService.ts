import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ email, firstName, lastName, password }: UserData) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
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
}
