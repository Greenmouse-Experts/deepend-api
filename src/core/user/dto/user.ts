import { ApiProperty } from "@nestjs/swagger";
import * as joi from "joi";

export class CreateUserDto {
	@ApiProperty({
		description: "User's email address",
		example: "user@gmail.com",
	})
	email: string;

	@ApiProperty({
		description: "User's first name",
		example: "John",
	})
	firstName: string;

	@ApiProperty({
		description: "User's last name",
		example: "Doe",
	})
	lastName: string;

	@ApiProperty({
		description: "User's phone number",
		example: "+1234567890",
	})
	phone?: string;

	@ApiProperty({
		description: "User's address",
		example: "123 Main St, City, Country",
	})
	address?: string;

	@ApiProperty({
		description: "User's country ID",
		example: 1,
	})
	countryId: number;

	@ApiProperty({
		description: "User's password",
		example: "strongPassword123!",
	})
	password: string;
}

export const CreateUserSchema = joi.object({
	email: joi.string().email().trim().required(),
	firstName: joi.string().min(2).max(30).trim().required(),
	lastName: joi.string().min(2).max(30).trim().required(),
	phone: joi.string().min(7).max(20).trim().optional(),
	address: joi.string().max(255).trim().required(),
	countryId: joi.number().integer().positive().required(),
	password: joi.string().min(8).max(100).trim().required(),
});

export class LoginUserDto {
	@ApiProperty({
		description: "User's email address",
		example: "user@gmail.com",
	})
	email: string;

	@ApiProperty({
		description: "User's password",
		example: "strongPassword123!",
	})
	password: string;
}

export const LoginUserSchema = joi.object({
	email: joi.string().email().trim().required(),
	password: joi.string().min(8).max(100).trim().required(),
});

export class VerifyEmailDto {
	@ApiProperty({
		description: "OTP code sent to user's email",
		example: "123456",
	})
	code: string;

	@ApiProperty({
		description: "User's ID",
		example: "user-uuid-1234",
	})
	userId: string;
}

export const VerifyEmailSchema = joi.object({
	code: joi.string().length(6).trim().required(),
	userId: joi.string().required(),
});

export class ResendVerificationDto {
	@ApiProperty({
		description: "User's email address",
		example: "user@gmail.com",
	})
	email: string;
}

export const ResendVerificationSchema = joi.object({
	email: joi.string().email().trim().required(),
});

export class RefreshTokenDto {
	@ApiProperty({
		description: "User's ID",
		example: "user-uuid-1234",
	})
	userId: string;
}

export const RefreshTokenSchema = joi.object({
	userId: joi.string().required(),
});
