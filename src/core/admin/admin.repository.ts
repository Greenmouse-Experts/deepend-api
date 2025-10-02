import { Injectable } from "@nestjs/common";
import { and, eq, inArray, sql } from "drizzle-orm";
import { DatabaseService } from "src/database/database.service";
import {
	advertBanners,
	foodAddonCategories,
	foodAddonsItems,
	foodCategories,
} from "src/database/schema/categories";
import {
	CreateFood,
	foods,
	FoodToAddonsCategories,
	foodToAddonsCategories,
	foodToAddonsItems,
	FoodToAddonsItems,
} from "src/database/schema/services";

@Injectable()
export class AdminRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async createFood(foodData: CreateFood) {
		const result = await this.databaseService.db
			.insert(foods)
			.values(foodData)
			.$returningId();

		return result[0];
	}

	async updateFood(id: string, foodData: Partial<CreateFood>) {
		const result = await this.databaseService.db
			.update(foods)
			.set(foodData)
			.where(eq(foods.id, id));

		return result;
	}

	async deleteFood(id: string) {
		const result = await this.databaseService.db
			.delete(foods)
			.where(eq(foods.id, id));

		return result;
	}

	async getFoodById(id: string) {
		const food = await this.databaseService.db
			.select()
			.from(foods)
			.where(eq(foods.id, id));

		return food;
	}

	async addFoodAddons(
		addonCategories: FoodToAddonsCategories[],
		addonItems: FoodToAddonsItems[],
	) {
		return await this.databaseService.db.transaction(async (tx) => {
			if (addonCategories.length > 0) {
				await tx
					.insert(foodToAddonsCategories)
					.values(addonCategories)
					.onDuplicateKeyUpdate({ set: { foodId: sql`food_id` } });
			}

			if (addonItems.length > 0) {
				await tx.insert(foodToAddonsItems).values(addonItems);
			}
		});
	}

	async removeFoodAddonCategory(foodId: string, addonCategoryIds: number[]) {
		return await this.databaseService.db.transaction(async (tx) => {
			if (addonCategoryIds.length > 0) {
				await tx
					.delete(foodToAddonsItems)
					.where(
						and(
							eq(foodToAddonsItems.foodId, foodId),
							inArray(foodToAddonsItems.addonCategoryId, addonCategoryIds),
						),
					);

				const deletedFoodAddonCategory = await tx
					.delete(foodToAddonsCategories)
					.where(
						and(
							eq(foodToAddonsCategories.foodId, foodId),
							inArray(foodToAddonsCategories.addonCategoryId, addonCategoryIds),
						),
					);

				return deletedFoodAddonCategory;
			}
		});
	}

	async removeFoodAddonItems(foodId: string, addonItemIds: number[]) {
		return await this.databaseService.db
			.delete(foodToAddonsItems)
			.where(
				and(
					eq(foodToAddonsItems.foodId, foodId),
					inArray(foodToAddonsItems.addonItemId, addonItemIds),
				),
			);
	}

	async getFoodAddonsByFoodId(foodId: string) {
		const result =
			await this.databaseService.db.query.foodToAddonsCategories.findMany({
				where: eq(foodToAddonsCategories.foodId, foodId),
				with: {
					category: {
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
			});

		return result.map((item) => ({
			id: item.category.id,
			name: item.category.name,
			description: item.category.description,
			items: item.category.items,
		}));
	}

	async getFoodByName(name: string) {
		const food = await this.databaseService.db
			.select()
			.from(foods)
			.where(eq(foods.name, name));

		return food;
	}

	async getAllFoods(offset: number, limit: number) {
		const foodsList = await this.databaseService.db
			.select()
			.from(foods)
			.limit(limit)
			.offset(offset);
		return foodsList;
	}

	async createFoodCategory(name: string, description?: string, icon?: string) {
		const result = await this.databaseService.db
			.insert(foodCategories)
			.values({ name, description, icon })
			.$returningId();

		return result;
	}

	async updateFoodCategory(
		id: number,
		name: string,
		description?: string,
		icon?: string,
	) {
		const result = await this.databaseService.db
			.update(foodCategories)
			.set({ name, description, icon })
			.where(eq(foodCategories.id, id));

		return result;
	}

	async deleteFoodCategory(id: number) {
		const result = await this.databaseService.db
			.delete(foodCategories)
			.where(eq(foodCategories.id, id));
		return result;
	}

	async getFoodCategoryByName(name: string) {
		const category = await this.databaseService.db
			.select()
			.from(foodCategories)
			.where(eq(foodCategories.name, name));

		return category;
	}

	async getFoodCategoryById(id: number) {
		const category = await this.databaseService.db
			.select()
			.from(foodCategories)
			.where(eq(foodCategories.id, id));

		return category;
	}

	async getAllFoodCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(foodCategories)
			.limit(limit)
			.offset(offset);
		return categories;
	}

	async createFoodAddonCategories(
		addons: { name: string; description?: string }[],
	) {
		const result = await this.databaseService.db
			.insert(foodAddonCategories)
			.values(addons)
			.$returningId();

		return result;
	}

	async updateFoodAddonCategory(
		id: number,
		name: string,
		description?: string,
	) {
		const result = await this.databaseService.db
			.update(foodAddonCategories)
			.set({ name, description })
			.where(eq(foodAddonCategories.id, id));

		return result;
	}

	async deleteFoodAddonCategory(id: number) {
		const result = await this.databaseService.db
			.delete(foodAddonCategories)
			.where(eq(foodAddonCategories.id, id));

		return result;
	}

	async getAllFoodAddonCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(foodAddonCategories)
			.limit(limit)
			.offset(offset);

		return categories;
	}

	async createFoodAddonItems(
		addonItems: {
			categoryId: number;
			name: string;
			description?: string;
			price: string;
		}[],
	) {
		return await this.databaseService.db
			.insert(foodAddonsItems)
			.values(addonItems)
			.$returningId();
	}

	async updateFoodAddonItem(
		id: number,
		data: {
			categoryId?: number;
			name?: string;
			description?: string;
			price?: string;
		},
	) {
		return await this.databaseService.db
			.update(foodAddonsItems)
			.set(data)
			.where(eq(foodAddonsItems.id, id));
	}

	async deleteFoodAddonItem(id: number) {
		return await this.databaseService.db
			.delete(foodAddonsItems)
			.where(eq(foodAddonsItems.id, id));
	}

	async getAllFoodAddonItemsByCategory(
		categoryId: number,
		offset: number,
		limit: number,
	) {
		return await this.databaseService.db
			.select()
			.from(foodAddonsItems)
			.where(eq(foodAddonsItems.categoryId, categoryId))
			.limit(limit)
			.offset(offset);
	}

	async makeFoodAvailable(id: string) {
		const result = await this.databaseService.db
			.update(foods)
			.set({ isAvailable: true })
			.where(eq(foods.id, id));

		return result;
	}

	async makeFoodUnavailable(id: string) {
		const result = await this.databaseService.db
			.update(foods)
			.set({ isAvailable: false })
			.where(eq(foods.id, id));

		return result;
	}

	async createAdvertBanner({
		name,
		imageUrls,
		linkUrl,
	}: {
		name: string;
		imageUrls: Array<{ url: string; path: string }>;
		linkUrl: string;
	}) {
		const result = await this.databaseService.db
			.insert(advertBanners)
			.values({ name, imageUrls, linkUrl })
			.$returningId();

		return result[0];
	}

	async updateAdvertBanner(
		bannerId: number,
		{
			name,
			imageUrls,
			linkUrl,
		}: {
			name?: string;
			imageUrls?: Array<{ url: string; path: string }>;
			linkUrl?: string;
		},
	) {
		const updatedAdvertBanner = await this.databaseService.db
			.update(advertBanners)
			.set({ name, imageUrls, linkUrl })
			.where(eq(advertBanners.id, bannerId));

		return updatedAdvertBanner;
	}

	async getAdvertBanners(offset: number, limit: number) {
		return await this.databaseService.db
			.select()
			.from(advertBanners)
			.limit(limit)
			.offset(offset)
			.orderBy(advertBanners.id);
	}

	async deleteAdvertBanner(bannerId: number) {
		return await this.databaseService.db
			.delete(advertBanners)
			.where(eq(advertBanners.id, bannerId));
	}

	async publishAdvertBanner(bannerId: number) {
		return await this.databaseService.db
			.update(advertBanners)
			.set({ isPublished: true })
			.where(eq(advertBanners.id, bannerId));
	}

	async unpublishAdvertBanner(bannerId: number) {
		return await this.databaseService.db
			.update(advertBanners)
			.set({ isPublished: false })
			.where(eq(advertBanners.id, bannerId));
	}
}
