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

	@ApiProperty({
		description: "User's fcmToken",
		example: "fcm_jlajidfjiajdfiajsdjj",
	})
	fcmToken?: string;
}

export const LoginUserSchema = joi.object({
	email: joi.string().email().trim().required(),
	password: joi.string().min(8).max(100).trim().required(),
	fcmToken: joi.string().optional(),
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

export class ForgotPasswordDto {
	@ApiProperty({
		description: "User's email address",
		example: "user@gmail.com",
	})
	email: string;
}

export const ForgotPasswordSchema = joi.object({
	email: joi.string().email().trim().required(),
});

export class ResetPasswordDto {
	@ApiProperty({
		description: "OTP code sent to user's email",
		example: "123456",
	})
	code: string;
	@ApiProperty({
		description: "New password for the user",
		example: "newStrongPassword123!",
	})
	newPassword: string;
}

export const ResetPasswordSchema = joi.object({
	code: joi.string().length(6).trim().required(),
	newPassword: joi.string().min(8).max(100).trim().required(),
});

export class ChangePasswordDto {
	@ApiProperty({
		description: "Current password of the user",
		example: "currentPassword123!",
	})
	currentPassword: string;

	@ApiProperty({
		description: "New password for the user",
		example: "newStrongPassword123!",
	})
	newPassword: string;
}

export const ChangePasswordSchema = joi.object({
	currentPassword: joi.string().min(8).max(100).trim().required(),
	newPassword: joi.string().min(8).max(100).trim().required(),
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

class UpdateUserProfilePictureDto {
	@ApiProperty({
		description: "URL of the new profile picture",
		example: "https://example.com/profile-pic.jpg",
	})
	url: string;

	@ApiProperty({
		description: "Path where the profile picture is stored",
		example: "/uploads/profile-pic.jpg",
	})
	path: string;
}

export class UpdateUserProfileDto {
	@ApiProperty({
		description: "User's email address",
		example: "deepend@gmail.com",
	})
	email?: string;

	@ApiProperty({
		description: "User's profile picture",
		type: UpdateUserProfilePictureDto,
	})
	profilePicture?: UpdateUserProfilePictureDto;

	@ApiProperty({
		description: "User's first name",
		example: "John",
	})
	firstName?: string;

	@ApiProperty({
		description: "User's last name",
		example: "Doe",
	})
	lastName?: string;

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
}

export const UpdateUserProfileSchema = joi.object({
	email: joi.string().email().trim().optional(),
	profilePicture: joi
		.object({
			url: joi.string().uri().required(),
			path: joi.string().required(),
		})
		.optional(),
	firstName: joi.string().min(2).max(30).trim().optional(),
	lastName: joi.string().min(2).max(30).trim().optional(),
	phone: joi.string().min(7).max(20).trim().optional(),
	address: joi.string().max(255).trim().optional(),
});

class CartAddons {
	@ApiProperty({
		description: "Type of addon",
		example: "vrgames",
	})
	addonType: "vrgames" | "movie" | "hotel" | "studio_session" | "food";

	@ApiProperty({
		description: "Addon ID",
		example: "addon-uuid-1234",
	})
	addonId: string;

	@ApiProperty({
		description: "Quantity of the addon",
		example: 1,
	})
	quantity: number;
}

export class AddToCartDto {
	@ApiProperty({
		description: "Type of service to add to cart",
		example: "vrgames",
	})
	serviceType: "vrgames" | "movie" | "hotel" | "studio_session" | "food";

	@ApiProperty({
		description: "ID of the service to add to cart",
		example: "service-uuid-1234",
	})
	serviceId: string;

	@ApiProperty({
		description: "Quantity of the service",
		example: 2,
	})
	quantity: number;

	@ApiProperty({
		description: "Scheduled date for the service (if applicable)",
		example: "2024-07-01",
	})
	scheduledDate?: string;

	@ApiProperty({
		description: "Scheduled start time for the service (if applicable)",
		example: "14:00",
	})
	scheduledStartTime?: string;

	@ApiProperty({
		description: "Scheduled end time for the service (if applicable)",
		example: "15:00",
	})
	scheduledEndTime?: string;

	@ApiProperty({
		description: "List of addons for the cart item",
		type: [CartAddons],
	})
	addons?: CartAddons[];
}

export const AddToCartSchema = joi
	.object({
		serviceType: joi
			.string()
			.valid("vrgames", "movie", "hotel", "food")
			.required(),
		serviceId: joi.string().required(),
		quantity: joi.number().integer().positive().required(),
		addons: joi
			.array()
			.items(
				joi.object({
					addonType: joi
						.string()
						.valid("vrgames", "movie", "hotel", "food")
						.required(),
					addonId: joi.string().required(),
					quantity: joi.number().integer().positive().required(),
				}),
			)
			.optional(),
	})
	.messages({
		"any.required": "{{#label}} is required",
		"string.pattern.base":
			"{{#label}} must be in the format HH:MM (24-hour format)",
	});
