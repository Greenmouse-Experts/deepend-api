import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";

export class CreateFoodDto {
	@ApiProperty({ example: "Pizza", description: "Name of the food item" })
	name: string;

	@ApiProperty({
		example: "Delicious cheese pizza",
		description: "Description of the food item",
		required: false,
	})
	description?: string;

	@ApiProperty({ example: 9.99, description: "Price of the food item" })
	price: string;

	@ApiProperty({ example: 10, description: "Quantity of the food item" })
	quantity: number;

	@ApiProperty({ example: 1, description: "Category ID of the food item" })
	categoryId: number;

	@ApiProperty({
		example: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"],
		description: "List of image URLs for the food item",
		required: false,
	})
	imageUrls?: string[];
}

export const CreateFoodSchema = Joi.object({
	name: Joi.string().max(255).trim().required(),
	description: Joi.string().max(1024).optional(),
	price: Joi.number().precision(2).positive().required(),
	quantity: Joi.number().integer().min(1).required(),
	categoryId: Joi.number().integer().positive().required(),
	imageUrls: Joi.array().items(Joi.string().uri()).optional(),
});

export class UpdateFoodDto {
	@ApiProperty({
		example: "Pizza",
		description: "Name of the food item",
		required: false,
	})
	name?: string;

	@ApiProperty({
		example: "Delicious cheese pizza",
		description: "Description of the food item",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: 9.99,
		description: "Price of the food item",
		required: false,
	})
	price?: string;

	@ApiProperty({
		example: 10,
		description: "Quantity of the food item",
		required: true,
	})
	quantity: number;

	@ApiProperty({
		example: true,
		description: "Availability status of the food item",
		required: true,
	})
	isAvailable: boolean;

	@ApiProperty({
		example: 1,
		description: "Category ID of the food item",
		required: false,
	})
	categoryId?: number;

	@ApiProperty({
		example: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"],
		description: "List of image URLs for the food item",
		required: false,
	})
	imageUrls?: string[];
}

export const UpdateFoodSchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	description: Joi.string().max(1024).optional(),
	price: Joi.number().precision(2).positive().optional(),
	quantity: Joi.number().integer().min(1).required(),
	isAvailable: Joi.boolean().required(),
	categoryId: Joi.number().integer().positive().optional(),
	imageUrls: Joi.array().items(Joi.string().uri()).optional(),
});

export class AddFoodAddonItems {
	@ApiProperty({ example: 1, description: "Addon Category ID" })
	addonCategoryId: number;
	@ApiProperty({ example: 1, description: "Addon Item ID" })
	addonItemId: number;
}

export class AddFoodAddonsDto {
	@ApiProperty({
		type: [AddFoodAddonItems],
		description: "List of addon items to be added",
	})
	addons: AddFoodAddonItems[];
}

export const AddFoodAddonItemsSchema = Joi.object({
	addons: Joi.array().items({
		addonCategoryId: Joi.number().integer().positive().required(),
		addonItemId: Joi.number().integer().positive().required(),
	}),
})
	.min(1)
	.required();

export class RemoveFoodAddonCategoryDto {
	@ApiProperty({
		example: [1, 2],
		description: "List of addon category IDs to be removed",
	})
	addonCategoryIds: number[];
}

export const RemoveFoodAddonCategorySchema = Joi.object({
	addonCategoryIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});

export class RemoveFoodAddonItemsDto {
	@ApiProperty({
		example: [1, 2],
		description: "List of addon item IDs to be removed",
	})
	addonItemIds: number[];
}

export const RemoveFoodAddonItemsSchema = Joi.object({
	addonItemIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});
