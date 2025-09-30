import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "src/database/database.service";
import { foodCategories } from "src/database/schema/categories";

@Injectable()
export class AdminRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async createFoodCategory(name: string, description?: string) {
		const result = await this.databaseService.db
			.insert(foodCategories)
			.values({ name, description })
			.$returningId();

		return result;
	}

	async updateFoodCategory(id: number, name: string, description?: string) {
		const result = await this.databaseService.db
			.update(foodCategories)
			.set({ name, description })
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
}
