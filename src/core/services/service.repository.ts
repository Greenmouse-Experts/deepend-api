import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { and, desc, eq, like, sql } from "drizzle-orm";
import {
	advertBanners,
	foodAddonCategories,
	foodAddonsItems,
	foodCategories,
	foods,
	foodToAddonsCategories,
} from "src/database/schema";

@Injectable()
export class ServicesRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async getFoodCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(foodCategories)
			.limit(limit)
			.offset(offset);

		return categories;
	}

	async getFoodById(id: string) {
		const food = await this.databaseService.db.query.foods.findFirst({
			where: eq(foods.id, id),
			with: {
				category: {
					columns: {
						createdAt: false,
						updatedAt: false,
					},
				},
				addons: {
					columns: {
						createdAt: false,
						updatedAt: false,
						foodId: false,
						addonCategoryId: false,
					},
					with: {
						category: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
							with: {
								items: {
									columns: {
										createdAt: false,
										updatedAt: false,
									},
								},
							},
						},
					},
				},
			},
		});

		return {
			...food,
			addons: food?.addons.map((addon) => ({
				...addon.category,
				items: addon.category.items,
			})),
		};
	}

	async getAllFoods({
		offset,
		limit,
		categoryId,
		search,
	}: { offset: number; limit: number; categoryId?: number; search?: string }) {
		// Old way using relations (Didn't work with mariadb on cpanel)
		// const result = await this.databaseService.db.query.foods.findMany({
		// 	where: (foods, { and, like }) =>
		// 		and(
		// 			categoryId ? eq(foods.categoryId, categoryId) : undefined,
		// 			search ? like(foods.name, `%${search}%`) : undefined,
		// 			eq(foods.isAvailable, true),
		// 		),
		// 	with: {
		// 		category: {
		// 			columns: {
		// 				createdAt: false,
		// 				updatedAt: false,
		// 			},
		// 		},
		// 		addons: {
		// 			columns: {
		// 				createdAt: false,
		// 				updatedAt: false,
		// 				foodId: false,
		// 				addonCategoryId: false,
		// 			},
		// 			with: {
		// 				category: {
		// 					columns: {
		// 						createdAt: false,
		// 						updatedAt: false,
		// 					},
		// 					with: {
		// 						items: {
		// 							columns: {
		// 								createdAt: false,
		// 								updatedAt: false,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// 	limit,
		// 	offset,
		// 	orderBy: (foods, { desc }) => [desc(foods.createdAt)],
		// });

		const result = await this.databaseService.db
			.select({
				id: foods.id,
				name: foods.name,
				description: foods.description,
				price: foods.price,
				imageUrls: foods.imageUrls,
				categoryId: foods.categoryId,
				isAvailable: foods.isAvailable,
				category: {
					id: foodCategories.id,
					name: foodCategories.name,
				},
				addons: sql<{
					id: string;
					name: string;
					items: { id: string; name: string; price: number }[];
				}>`CASE 
    WHEN COUNT(${foodAddonCategories.id}) = 0 
    THEN JSON_ARRAY()
    ELSE JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', ${foodAddonCategories.id},
            'name', ${foodAddonCategories.name},
            'description', ${foodAddonCategories.description},
            'items', COALESCE((
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', items.id,
                        'name', items.name,
                        'price', items.price
                    )
                )
                FROM ${foodAddonsItems} AS items
                WHERE items.category_id = ${foodAddonCategories.id}
            ), JSON_ARRAY())
        )
    )
END`.as("addons"),
			})
			.from(foods)
			.leftJoin(foodCategories, eq(foods.categoryId, foodCategories.id))
			.leftJoin(
				foodToAddonsCategories,
				eq(foodToAddonsCategories.foodId, foods.id),
			)
			.leftJoin(
				foodAddonCategories,
				eq(foodToAddonsCategories.addonCategoryId, foodAddonCategories.id),
			)
			.where(
				and(
					categoryId ? eq(foods.categoryId, categoryId) : undefined,
					search ? like(foods.name, `%${search}%`) : undefined,
					eq(foods.isAvailable, true),
				),
			)
			.groupBy(foods.id, foodCategories.id, foodCategories.name)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(foods.createdAt));

		return result;
	}

	async getAllAdvertBanners(offset: number, limit: number) {
		const banners = await this.databaseService.db
			.select()
			.from(advertBanners)
			.where(eq(advertBanners.isPublished, true))
			.limit(limit)
			.offset(offset)
			.orderBy(desc(advertBanners.createdAt));

		return banners;
	}
}
