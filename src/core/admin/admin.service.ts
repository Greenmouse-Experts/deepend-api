import { BadRequestException, Injectable } from "@nestjs/common";
import { AdminRepository } from "./admin.repository";

@Injectable()
export class AdminService {
	constructor(private readonly adminRepository: AdminRepository) {}

	async createFoodCategory(name: string, description?: string) {
		const existingCategory =
			await this.adminRepository.getFoodCategoryByName(name);

		if (existingCategory.length > 0) {
			throw new BadRequestException(
				"Food category with this name already exists",
			);
		}

		return await this.adminRepository.createFoodCategory(name, description);
	}

	async updateFoodCategory(id: number, name: string, description?: string) {
		const existingCategory =
			await this.adminRepository.getFoodCategoryByName(name);

		if (existingCategory.length > 0 && existingCategory[0].id !== id) {
			throw new BadRequestException(
				"Food category with this name already exists",
			);
		}

		await this.adminRepository.updateFoodCategory(id, name, description);

		return { message: "Food category updated successfully" };
	}

	async deleteFoodCategory(id: number) {
		await this.adminRepository.deleteFoodCategory(id);
		return { message: "Food category deleted successfully" };
	}

	async getAllFoodCategories(page: number, limit: number) {
		const offset = (page - 1) * limit;
		return await this.adminRepository.getAllFoodCategories(offset, limit);
	}
}
