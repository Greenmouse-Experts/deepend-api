import {
	BadRequestException,
	ForbiddenException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { CreateUser } from "src/database/schema";
import { PasswordService } from "../password/password.service";
import { generateOtp, maskEmail } from "src/common/helpers";
import { getHashedString } from "src/common/hash";
import { VerificationService } from "../verification/verification.service";
import { MailService } from "src/mail/mail.service";
import { JwtService } from "../jwt/jwt.service";
import { LoginUserDto, UpdateUserProfileDto } from "../user/dto/user";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly passwordService: PasswordService,
		private readonly verificationService: VerificationService,
		private readonly mailService: MailService,
		private readonly jwtService: JwtService,
	) {}

	async registerUser(
		userData: Omit<CreateUser, "id" | "createdAt" | "updatedAt" | "role">,
	) {
		try {
			const existingUser = await this.userService.getUserByEmail(
				userData.email,
			);

			if (existingUser) {
				throw new BadRequestException("User with this email already exists");
			}

			// Hash the password before storing
			userData.password = await this.passwordService.hashPassword(
				userData.password,
			);

			const newUser = {
				...userData,
				role: "user", // Assign default role
			} as Omit<CreateUser, "id" | "createdAt" | "updatedAt">;

			const createdUser = await this.userService.createUser(newUser);

			if (!createdUser) {
				throw new BadRequestException("Failed to create user");
			}

			await this.mailService.sendWelcomeEmail({
				email: newUser.email,
				firstName: newUser.firstName,
			});

			// Generate and send OTP for email verification
			const otpCode = await this.getVerificationOtpCode(createdUser.id);

			await this.mailService.sendEmailVerification({
				email: newUser.email,
				code: otpCode,
				firstName: newUser.firstName,
			});

			const { password, ...userWithoutPassword } = newUser;

			return { id: createdUser.id, ...userWithoutPassword };
		} catch (error) {
			throw error;
		}
	}

	async loginUser({ email, password, fcmToken }: LoginUserDto) {
		const user = await this.userService.getUserByEmail(email);

		if (!user) {
			throw new BadRequestException("Invalid email or password");
		}

		if (
			!(await this.passwordService.comparePassword(password, user.password))
		) {
			throw new BadRequestException("Invalid email or password");
		}

		if (!user.emailVerified) {
			const otpCode = await this.getNewVerificationOtpCode(user.id);

			await this.mailService.sendEmailVerification({
				email: user.email,
				code: otpCode,
				firstName: user.firstName,
			});

			throw new HttpException(
				{
					userId: user.id,
					message: `Email not verified. A new verification code has been sent to ${maskEmail(user.email)}`,
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		const { access_token, refresh_token } = await this.getTokens(
			user.id,
			user.role,
		);

		await this.userService.updateUser(user.id, {
			refreshToken: refresh_token,
			fcmToken,
		});

		const {
			password: pwd,
			refreshToken: rft,
			updatedAt: udt,
			...userWithoutPassword
		} = user;

		return { ...userWithoutPassword, access_token, refresh_token };
	}

	async loginAdmin({ email, password }: LoginUserDto) {
		const user = await this.userService.getUserByEmail(email);

		if (!user || user.role !== "admin") {
			throw new NotFoundException("Admin with this email does not exist");
		}

		if (
			!(await this.passwordService.comparePassword(password, user.password))
		) {
			throw new BadRequestException("Invalid email or password");
		}

		const { access_token, refresh_token } = await this.getTokens(
			user.id,
			user.role,
		);

		await this.userService.updateUser(user.id, {
			refreshToken: refresh_token,
		});

		const {
			password: pwd,
			refreshToken: rft,
			updatedAt: udt,
			...userWithoutPassword
		} = user;

		return { ...userWithoutPassword, access_token, refresh_token };
	}

	async updateUserProfile(userId: string, updateData: UpdateUserProfileDto) {
		const user = await this.userService.getUserById(userId);

		if (!user) {
			throw new NotFoundException("User not found");
		}

		await this.userService.updateUserProfile(userId, updateData);

		return { message: "Profile updated successfully" };
	}

	async getUserProfile(userId: string) {
		const userProfile = await this.userService.getUserProfile(userId);

		if (!userProfile) {
			throw new NotFoundException("User not found");
		}

		return userProfile;
	}

	async getVerificationOtpCode(userId: string) {
		const otpCode = generateOtp();

		const hashedOtpCode = getHashedString(otpCode);

		await this.verificationService.saveHashedOtpCode(userId, hashedOtpCode);

		return otpCode;
	}

	async getNewVerificationOtpCode(userId: string) {
		await this.verificationService.deleteOtpCode(userId);

		const otpCode = await this.getVerificationOtpCode(userId);

		return otpCode;
	}

	async verifyEmail(userId: string, code: string) {
		const isCodeValid = await this.verificationService.verifyOtp(userId, code);

		if (!isCodeValid.isValid) {
			throw new BadRequestException("Invalid or expired verification code");
		}

		if (isCodeValid.userId !== userId) {
			throw new BadRequestException("Invalid verification attempt");
		}

		await this.userService.updateUser(isCodeValid.userId, {
			emailVerified: true,
		});

		return { message: "Email verified successfully" };
	}

	async forgotPassword(email: string) {
		const user = await this.userService.getUserByEmail(email);

		if (!user) {
			throw new NotFoundException("User with this email does not exist");
		}

		const otpCode = await this.getNewVerificationOtpCode(user.id);

		await this.mailService.sendPasswordReset({
			email: user.email,
			code: otpCode,
			firstName: user.firstName,
		});

		return {
			userId: user.id,
			message: `A password reset code has been sent to ${maskEmail(user.email)}`,
		};
	}

	async resetPassword({
		userId,
		code,
		newPassword,
	}: { userId: string; code: string; newPassword: string }) {
		const isCodeValid = await this.verificationService.verifyOtp(userId, code);

		if (!isCodeValid.isValid) {
			throw new BadRequestException("Invalid or expired verification code");
		}

		if (isCodeValid.userId !== userId) {
			throw new BadRequestException("Invalid verification attempt");
		}

		const hashedPassword = await this.passwordService.hashPassword(newPassword);

		await this.userService.updateUser(isCodeValid.userId, {
			password: hashedPassword,
		});

		return { message: "Password reset successfully" };
	}

	async changePassword(
		userId: string,
		{
			currentPassword,
			newPassword,
		}: { currentPassword: string; newPassword: string },
	) {
		const user = await this.userService.getUserById(userId);

		if (!user) {
			throw new NotFoundException("User not found");
		}

		if (
			!(await this.passwordService.comparePassword(
				currentPassword,
				user.password,
			))
		) {
			throw new BadRequestException("Current password is incorrect");
		}

		const hashedPassword = await this.passwordService.hashPassword(newPassword);

		await this.userService.updateUser(userId, {
			password: hashedPassword,
		});

		return { message: "Password changed successfully" };
	}

	async getTokens(userId: string, role: string) {
		const [access_token, refresh_token] = await Promise.all([
			await this.jwtService.signAccessToken({ userId, role }),
			await this.jwtService.signRefreshToken({ id: userId }),
		]);

		return { access_token, refresh_token };
	}

	async resendVerificationCode(email: string) {
		const user = await this.userService.getUserByEmail(email);

		if (!user) {
			throw new BadRequestException("User with this email does not exist");
		}

		if (user.emailVerified) {
			throw new BadRequestException("Email is already verified");
		}

		const otpCode = await this.getNewVerificationOtpCode(user.id);

		await this.mailService.sendEmailVerification({
			email: user.email,
			code: otpCode,
			firstName: user.firstName,
		});

		return {
			userId: user.id,
			message: `A new verification code has been sent to ${maskEmail(user.email)}`,
		};
	}

	async refreshToken(userId: string) {
		const user = await this.userService.getUserById(userId);

		if (!user || !user.refreshToken)
			throw new ForbiddenException("Access Denied");

		//Generate new access token and
		const access_token = await this.jwtService.signAccessToken({
			userId,
			role: user.role,
		});
		const refresh_token = user.refreshToken;

		return {
			id: userId,
			message: "Access token refreshed successfully",
			access_token,
			refresh_token,
		};
	}

	async logoutUser(userId: string) {
		const user = await this.userService.getUserById(userId);

		if (!user) {
			throw new NotFoundException("User not found");
		}

		await this.userService.updateUser(userId, {
			refreshToken: null,
		});

		return { message: "Signed out successfully" };
	}
}
