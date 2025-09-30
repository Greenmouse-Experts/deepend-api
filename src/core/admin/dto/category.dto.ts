import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";

export class CreateFoodCategoryDto {
	@ApiProperty({
		example: "Fruits",
		description: "The name of the food category",
	})
	name: string;

	@ApiProperty({
		example: "A category for all kinds of fruits",
		description: "The description of the food category",
		required: false,
	})
	description?: string;
}

export const CreateFoodCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	description: Joi.string().optional(),
});

export class UpdateFoodCategoryDto {
	@ApiProperty({
		example: "Fruits",
		description: "The name of the food category",
	})
	name: string;

	@ApiProperty({
		example: "A category for all kinds of fruits",
		description: "The description of the food category",
		required: false,
	})
	description?: string;
}

export const UpdateFoodCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	description: Joi.string().optional(),
});
