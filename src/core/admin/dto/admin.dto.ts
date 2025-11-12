import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";

export class CreateDeliverySettingsDto {
	@ApiProperty({
		example: 43.65107,
		description: "Origin latitude for delivery calculations",
	})
	originLat: string;

	@ApiProperty({
		example: -79.347015,
		description: "Origin longitude for delivery calculations",
	})
	originLng: string;

	@ApiProperty({
		example: 1.5,
		description: "Price per kilometer for delivery calculations",
	})
	pricePerKm: string;
}

export const DeliverySettingsSchema = Joi.object<CreateDeliverySettingsDto>({
	originLat: Joi.number().required().min(-90).max(90),
	originLng: Joi.number().required().min(-180).max(180),
	pricePerKm: Joi.number().required(),
});

export class UpdateDeliverySettingsDto {
	@ApiProperty({
		example: 43.65107,
		description: "Origin latitude for delivery calculations",
		required: false,
	})
	originLat?: string;

	@ApiProperty({
		example: -79.347015,
		description: "Origin longitude for delivery calculations",
		required: false,
	})
	originLng?: string;

	@ApiProperty({
		example: 1.5,
		description: "Price per kilometer for delivery calculations",
		required: false,
	})
	pricePerKm?: string;
}

export const UpdateDeliverySettingsSchema =
	Joi.object<UpdateDeliverySettingsDto>({
		originLat: Joi.number().optional().min(-90).max(90),
		originLng: Joi.number().optional().min(-180).max(180),
		pricePerKm: Joi.number().optional(),
	});
