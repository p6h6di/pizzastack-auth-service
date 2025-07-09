import bcrypt from "bcrypt";

export class CredentialService {
    comparePasswords(userPassword: string, hashedPassword: string) {
        return new Promise<boolean>((resolve, reject) => {
            bcrypt.compare(userPassword, hashedPassword, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}
