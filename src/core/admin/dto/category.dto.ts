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

export class CreateVrGameCategoryDto {
	@ApiProperty({
		example: "action",
		description: "Name of the vrgame category",
	})
	name: string;

	@ApiProperty({
		example: "Action adventure vrgames",
		description: "Description of vrgame category",
	})
	description?: string;
}

export const CreateVrGameCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	description: Joi.string().optional(),
});

export class UpdateVrGameCategoryDto {
	@ApiProperty({
		example: "action",
		description: "Name of the vrgame category",
	})
	name: string;

	@ApiProperty({
		example: "Action adventure vrgames",
		description: "Description of vrgame category",
	})
	description?: string;
}

export const UpdateVrGameCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).optional(),
	description: Joi.string().optional(),
});

class CreateEquipmentCategoryDto {
	@ApiProperty({
		example: "Laptops",
		description: "The name of the equipment category",
	})
	name: string;

	@ApiProperty({
		example: "A category for all kinds of laptops",
		description: "The description of the equipment category",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: "https://example.com/icons/laptops.png",
		description: "The icon URL of the equipment category",
	})
	icon?: string;

	@ApiProperty({
		example: "/uploads/icons/laptops.png",
		description: "The icon path of the equipment category on the server",
	})
	iconPath?: string;
}

export class CreateEquipmentCategoriesDto {
	@ApiProperty({
		type: [CreateEquipmentCategoryDto],
		description: "List of equipment categories to be created",
	})
	categories: CreateEquipmentCategoryDto[];
}

export const CreateEquipmentCategoriesSchema = Joi.object({
	categories: Joi.array()
		.items(
			Joi.object({
				name: Joi.string().trim().max(255).required(),
				description: Joi.string().optional(),
				icon: Joi.string().uri().required(),
				iconPath: Joi.string().required(),
			}),
		)
		.min(1)
		.required(),
});

export class UpdateEquipmentCategoryDto {
	@ApiProperty({
		example: "Laptops",
		description: "The name of the equipment category",
	})
	name: string;

	@ApiProperty({
		example: "A category for all kinds of laptops",
		description: "The description of the equipment category",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: "https://example.com/icons/laptops.png",
		description: "The icon URL of the equipment category",
	})
	icon?: string;

	@ApiProperty({
		example: "/uploads/icons/laptops.png",
		description: "The icon path of the equipment category on the server",
	})
	iconPath?: string;
}

export const UpdateEquipmentCategorySchema = Joi.object({
	name: Joi.string().trim().max(255).optional(),
	description: Joi.string().optional(),
	icon: Joi.string().uri().optional(),
	iconPath: Joi.string().optional(),
});

export class CreateMovieGenreDto {
	@ApiProperty({
		example: "Action",
		description: "The name of the movie genre",
	})
	name: string;

	@ApiProperty({
		example: "Movies that are action-packed and thrilling",
		description: "The description of the movie genre",
		required: false,
	})
	description?: string;
}

export class CreateMovieGenresDto {
	@ApiProperty({
		type: [CreateMovieGenreDto],
		description: "List of movie genres to be created",
	})
	genres: CreateMovieGenreDto[];
}

export const CreateMovieGenresSchema = Joi.object({
	genres: Joi.array()
		.items(
			Joi.object({
				name: Joi.string().trim().max(255).required(),
				description: Joi.string().optional(),
			}),
		)
		.min(1)
		.required(),
});

export class UpdateMovieGenreDto {
	@ApiProperty({
		example: "Action",
		description: "The name of the movie genre",
	})
	name: string;

	@ApiProperty({
		example: "Movies that are action-packed and thrilling",
		description: "The description of the movie genre",
		required: false,
	})
	description?: string;
}

export const UpdateMovieGenreSchema = Joi.object({
	name: Joi.string().trim().max(255).optional(),
	description: Joi.string().optional(),
});
