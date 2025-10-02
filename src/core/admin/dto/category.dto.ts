import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";

export class CreateFoodCategoryDto {
	@ApiProperty({
		example: "Fruits",
		description: "The name of the food category",
	})
	name: string;

	@ApiProperty({
		example: "https://example.com/icons/fruits.png",
		description: "The icon URL of the food category",
	})
	icon?: string;

	@ApiProperty({
		example: "A category for all kinds of fruits",
		description: "The description of the food category",
		required: false,
	})
	description?: string;
}

export const CreateFoodCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	icon: Joi.string().uri().optional(),
	description: Joi.string().optional(),
});

export class UpdateFoodCategoryDto {
	@ApiProperty({
		example: "Fruits",
		description: "The name of the food category",
	})
	name: string;

	@ApiProperty({
		example: "https://example.com/icons/fruits.png",
		description: "The icon URL of the food category",
	})
	icon?: string;

	@ApiProperty({
		example: "A category for all kinds of fruits",
		description: "The description of the food category",
		required: false,
	})
	description?: string;
}

export const UpdateFoodCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	icon: Joi.string().uri().optional(),
	description: Joi.string().optional(),
});

export class CreateFoodAddonCategoryDto {
	@ApiProperty({
		example: "Sauces",
		description: "The name of the food addon category",
	})
	name: string;

	@ApiProperty({
		example: "A category for all kinds of sauces",
		description: "The description of the food addon category",
		required: false,
	})
	description?: string;
}

export class CreateFoodAddonCategories {
	@ApiProperty({
		type: [CreateFoodAddonCategoryDto],
		description: "List of food addon categories to be created",
	})
	addons: CreateFoodAddonCategoryDto[];
}

export const CreateFoodAddonCategoriesSchema = Joi.object({
	addons: Joi.array()
		.items(
			Joi.object({
				name: Joi.string().trim().max(255).required(),
				description: Joi.string().optional(),
			}),
		)
		.min(1)
		.required(),
});

export class UpdateFoodAddonCategoryDto {
	@ApiProperty({
		example: "Sauces",
		description: "The name of the food addon category",
	})
	name: string;

	@ApiProperty({
		example: "A category for all kinds of sauces",
		description: "The description of the food addon category",
		required: false,
	})
	description?: string;
}

export const UpdateFoodAddonCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	description: Joi.string().optional(),
});

export class CreateFoodAddonItemDto {
	@ApiProperty({
		example: "Extra Cheese",
		description: "The name of the food addon item",
	})
	name: string;

	@ApiProperty({
		example: "A generous serving of extra cheese",
		description: "The description of the food addon item",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: 1.5,
		description: "The price of the food addon item",
	})
	price: string;

	@ApiProperty({
		example: 1,
		description: "The ID of the food addon category this item belongs to",
	})
	categoryId: number;
}

export class CreateFoodAddonItemsDto {
	@ApiProperty({
		type: [CreateFoodAddonItemDto],
		description: "List of food addon items to be created",
	})
	addonItems: CreateFoodAddonItemDto[];
}

export const CreateFoodAddonItemsSchema = Joi.object({
	addonItems: Joi.array()
		.items(
			Joi.object({
				name: Joi.string().trim().max(255).required(),
				description: Joi.string().optional(),
				price: Joi.number().precision(2).min(0).required(),
				categoryId: Joi.number().integer().positive().required(),
			}),
		)
		.min(1)
		.required(),
});

export class UpdateFoodAddonItemDto {
	@ApiProperty({
		example: "Extra Cheese",
		description: "The name of the food addon item",
	})
	name?: string;

	@ApiProperty({
		example: "A generous serving of extra cheese",
		description: "The description of the food addon item",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: 1.5,
		description: "The price of the food addon item",
	})
	price?: string;

	@ApiProperty({
		example: 1,
		description: "The ID of the food addon category this item belongs to",
	})
	categoryId?: number;
}

export const UpdateFoodAddonItemSchema = Joi.object({
	name: Joi.string().trim().max(255).optional(),
	description: Joi.string().optional(),
	price: Joi.number().precision(2).min(0).optional(),
	categoryId: Joi.number().integer().positive().optional(),
});
