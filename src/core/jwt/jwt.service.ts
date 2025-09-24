import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

interface AccessTokenPayload {
	userId: string;
	role: string;
}

@Injectable()
export class JwtService {
	async signAccessToken(payload: AccessTokenPayload) {
		return jwt.sign(
			payload,
			process.env.JWT_ACCESS_SECRET as string,
			{
				expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
			} as unknown as jwt.SignOptions,
		);
	}

	async signRefreshToken(payload: object) {
		return jwt.sign(
			payload,
			process.env.JWT_REFRESH_SECRET as string,
			{
				expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME as string,
			} as unknown as jwt.SignOptions,
		);
	}

	async verifyAccessToken(token: string): Promise<jwt.JwtPayload | string> {
		const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
		return payload;
	}

	async verifyRefreshToken(token: string): Promise<jwt.JwtPayload | string> {
		const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
		return payload;
	}

	async getTokenExpiryTime(token: string): Promise<Date> {
		const decoded = jwt.decode(token) as jwt.JwtPayload | null;

		if (!decoded || !decoded.exp) {
			return new Date(Date.now());
		}

		return new Date(decoded.exp * 1000); // Convert UNIX timestamp to milliseconds
	}
}
