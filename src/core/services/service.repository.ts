import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { eq } from "drizzle-orm";
import { foodCategories, foods } from "src/database/schema";

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
		const result = await this.databaseService.db.query.foods.findMany({
			where: (foods, { and, like }) =>
				and(
					categoryId ? eq(foods.categoryId, categoryId) : undefined,
					search ? like(foods.name, `%${search}%`) : undefined,
					eq(foods.isAvailable, true),
				),
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
			limit,
			offset,
			orderBy: (foods, { desc }) => [desc(foods.createdAt)],
		});

		return result.map((food) => ({
			...food,
			addons: food.addons.map((addon) => ({
				...addon.category,
				items: addon.category.items,
			})),
		}));
	}
}
