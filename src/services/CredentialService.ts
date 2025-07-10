import bcrypt from "bcrypt";

export class CredentialService {
    async comparePasswords(userPassword: string, passwordHash: string) {
        return await bcrypt.compare(userPassword, passwordHash);
    }
}
