import * as Joi from "joi";

export class CreateFoodCategoryDto {
	name: string;
	description?: string;
}

export const CreateFoodCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	description: Joi.string().optional(),
});

export class UpdateFoodCategoryDto {
	name: string;
	description?: string;
}

export const UpdateFoodCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	description: Joi.string().optional(),
});
