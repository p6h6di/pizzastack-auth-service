import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
        let privateKey: string;
        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(500, "Could not find private key in config");
            throw error;
        }
        try {
            privateKey = Config.PRIVATE_KEY!;
        } catch {
            const error = createHttpError(500, "Error reading private key");
            throw error;
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });

        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload, newRefreshToken: { id: number }) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: String(newRefreshToken.id),
        });

        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
        });

        return newRefreshToken;
    }

    async deleteRefreshToken(tokenId: number) {
        return await this.refreshTokenRepository.delete({
            id: tokenId,
        });
    }
}
