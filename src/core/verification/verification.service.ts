import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { getHashedString } from "src/common/hash";
import { DatabaseService } from "src/database/database.service";
import { verification } from "src/database/schema/verification";

@Injectable()
export class VerificationService {
	constructor(private readonly databaseService: DatabaseService) {}
	async saveHashedOtpCode(userId: string, hashedOtpCode: string) {
		const expiryTime = new Date(
			Date.now() +
				Number(process.env.VERIFICATION_TOKEN_EXPIRY_TIME) * 60 * 1000,
		);

		await this.databaseService.db
			.insert(verification)
			.values({ userId, expiresAt: expiryTime, otpCode: hashedOtpCode });

		return;
	}

	async verifyOtp(
		userId: string,
		code: string,
	): Promise<{ isValid: boolean; userId?: string }> {
		//Get hash of the code
		const hashedOtpCode = getHashedString(code);

		const verificationCode =
			await this.databaseService.db.query.verification.findFirst({
				where: and(
					eq(verification.userId, userId),
					eq(verification.otpCode, hashedOtpCode),
				),
			});

		//Check if the a verification data
		if (!verificationCode) {
			//Token Invalid
			return { isValid: false };
		}

		const currentTime = new Date();

		//Check if code expired
		if (verificationCode.expiresAt < currentTime) {
			//Code Invalid
			return { isValid: false };
		}

		//Delete user verification code after use
		await this.deleteOtpCode(verificationCode.userId);

		// Token is valid, return user id
		return { isValid: true, userId: verificationCode.userId };
	}

	async deleteOtpCode(userId: string) {
		await this.databaseService.db
			.delete(verification)
			.where(eq(verification.userId, userId));
		return;
	}
}
