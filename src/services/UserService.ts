import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ email, firstName, lastName, password }: UserData) {
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

    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }
}
