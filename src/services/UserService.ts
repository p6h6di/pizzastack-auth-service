import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ email, firstName, lastName, password }: UserData) {
        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password,
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
