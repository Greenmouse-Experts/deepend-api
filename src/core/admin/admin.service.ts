import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { AdminRepository } from "./admin.repository";
import { CreateFood } from "src/database/schema/services";
import { isDatabaseError, mysqlErrorCodes } from "src/common/mysql.error";
import { AddFoodAddonItems, CreateVRGameDto } from "./dto/service.dto";

@Injectable()
export class AdminService {
	constructor(private readonly adminRepository: AdminRepository) {}

	async createFood(foodData: CreateFood) {
		try {
			return await this.adminRepository.createFood(foodData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid category ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Food with this name already exists");
			}

			throw error;
		}
	}

	async updateFood(id: string, foodData: Partial<CreateFood>) {
		try {
			const updatedFood = await this.adminRepository.updateFood(id, foodData);

			if (updatedFood[0].affectedRows === 0) {
				throw new BadRequestException("Food not found");
			}

			return { message: "Food updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid category ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Food with this name already exists");
			}

			throw error;
		}
	}

	async deleteFood(id: string) {
		try {
			const deletedFood = await this.adminRepository.deleteFood(id);

			if (deletedFood[0].affectedRows === 0) {
				throw new BadRequestException("Food not found");
			}

			return { message: "Food deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async addFoodAddons({
		foodId,
		addons,
	}: {
		foodId: string;
		addons: AddFoodAddonItems[];
	}) {
		try {
			const addonCategoriesids = [
				...new Set(addons.map((addon) => addon.addonCategoryId)),
			];

			const addonCategories = addonCategoriesids.map((addonCategoryId) => ({
				foodId,
				addonCategoryId,
			}));

			const addonItems = addons.map((addon) => ({
				foodId,
				addonCategoryId: addon.addonCategoryId,
				addonItemId: addon.addonItemId,
			}));

			await this.adminRepository.addFoodAddons(addonCategories, addonItems);

			return { message: "Food addon categories and items added successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException(
					"One or more invalid Addon category or item IDs",
				);
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more food addon categories or items with these IDs already exist for this food",
				);
			}

			throw error;
		}
	}

	async removeFoodAddonCategory(foodId: string, addonCategoryIds: number[]) {
		try {
			const deletedFoodAddonCategory =
				await this.adminRepository.removeFoodAddonCategory(
					foodId,
					addonCategoryIds,
				);

			if (
				deletedFoodAddonCategory &&
				deletedFoodAddonCategory[0].affectedRows === 0
			) {
				throw new BadRequestException(
					"No matching addon categories found for this food",
				);
			}

			return { message: "Food addon categories removed successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Addon category IDs");
			}

			throw error;
		}
	}

	async removeFoodAddonItems(foodId: string, addonItemIds: number[]) {
		try {
			const deleteFoodAddonItem =
				await this.adminRepository.removeFoodAddonItems(foodId, addonItemIds);

			if (deleteFoodAddonItem[0].affectedRows === 0) {
				throw new BadRequestException(
					"No matching addon items found for this food",
				);
			}

			return { message: "Food addon items removed successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Addon item IDs");
			}

			throw error;
		}
	}

	async getFoodAddonsByFoodId(foodId: string) {
		return await this.adminRepository.getFoodAddonsByFoodId(foodId);
	}

	async getFoodById(id: string) {
		const food = await this.adminRepository.getFoodById(id);

		if (food.length === 0) {
			throw new BadRequestException("Food not found");
		}

		return food[0];
	}

	async getAllFoods(page: number, limit: number) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllFoods(offset, limit);
	}

	async createFoodCategory(name: string, description?: string, icon?: string) {
		const existingCategory =
			await this.adminRepository.getFoodCategoryByName(name);

		if (existingCategory.length > 0) {
			throw new BadRequestException(
				"Food category with this name already exists",
			);
		}

		return await this.adminRepository.createFoodCategory(
			name,
			description,
			icon,
		);
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
		const existingCategory = await this.adminRepository.getFoodCategoryById(id);

		if (existingCategory.length === 0) {
			throw new BadRequestException("Food category not found");
		}
		await this.adminRepository.deleteFoodCategory(id);

		return { message: "Food category deleted successfully" };
	}

	async getAllFoodCategories(page: number, limit: number) {
		const offset = (page - 1) * limit;
		return await this.adminRepository.getAllFoodCategories(offset, limit);
	}

	async createFoodAddonCategories(
		addons: { name: string; description?: string }[],
	) {
		try {
			return await this.adminRepository.createFoodAddonCategories(addons);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more food addon categories with these names already exist",
				);
			}

			throw error;
		}
	}

	async updateFoodAddonCategory(
		id: number,
		name: string,
		description?: string,
	) {
		try {
			const updatedFoodAddonCategory =
				await this.adminRepository.updateFoodAddonCategory(
					id,
					name,
					description,
				);

			if (updatedFoodAddonCategory[0].affectedRows === 0) {
				throw new BadRequestException("Food addon category not found");
			}

			return { message: "Food addon category updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Food addon category with this name already exists",
				);
			}

			throw error;
		}
	}

	async deleteFoodAddonCategory(id: number) {
		const deletedFoodAddon =
			await this.adminRepository.deleteFoodAddonCategory(id);

		if (deletedFoodAddon[0].affectedRows === 0) {
			throw new BadRequestException("Food addon category not found");
		}

		return { message: "Food addon category deleted successfully" };
	}

	async getAllFoodAddonCategories(page: number, limit: number) {
		const offset = Number(page - 1) * Number(limit);

		return await this.adminRepository.getAllFoodAddonCategories(
			offset,
			Number(limit),
		);
	}

	async createFoodAddonItems(
		addonItems: {
			name: string;
			description?: string;
			price: string;
			categoryId: number;
		}[],
	) {
		try {
			return await this.adminRepository.createFoodAddonItems(addonItems);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Addon category IDs");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more food addon items with these names already exist",
				);
			}

			throw error;
		}
	}

	async updateFoodAddonItem(
		id: number,
		{
			name,
			description,
			price,
			categoryId,
		}: {
			name?: string;
			description?: string;
			price?: string;
			categoryId?: number;
		},
	) {
		try {
			const updatedFoodAddon = await this.adminRepository.updateFoodAddonItem(
				id,
				{
					name,
					description,
					price,
					categoryId,
				},
			);

			if (updatedFoodAddon[0].affectedRows === 0) {
				throw new BadRequestException("Food addon item not found");
			}

			return { message: "Food addon item updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid Addon category ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Food addon item with this name already exists",
				);
			}

			throw error;
		}
	}

	async deleteFoodAddonItem(id: number) {
		const deletedFoodAddon = await this.adminRepository.deleteFoodAddonItem(id);

		if (deletedFoodAddon[0].affectedRows === 0) {
			throw new BadRequestException("Food addon item not found");
		}

		return { message: "Food addon item deleted successfully" };
	}

	async getAllFoodAddonItemsByCategory(
		categoryId: number,
		page: number,
		limit: number,
	) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllFoodAddonItemsByCategory(
			categoryId,
			offset,
			limit,
		);
	}

	async makeFoodAvailable(id: string) {
		const result = await this.adminRepository.makeFoodAvailable(id);
		if (result[0].affectedRows === 0) {
			throw new BadRequestException("Food not found or already available");
		}
		return { message: "Food is now available" };
	}

	async makeFoodUnavailable(id: string) {
		const result = await this.adminRepository.makeFoodUnavailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException("Food not found or already unavailable");
		}
		return { message: "Food is now unavailable" };
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
		return await this.adminRepository.createAdvertBanner({
			name,
			imageUrls,
			linkUrl,
		});
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
		const updatedAdvertBanner = await this.adminRepository.updateAdvertBanner(
			bannerId,
			{
				name,
				imageUrls,
				linkUrl,
			},
		);

		if (updatedAdvertBanner[0].affectedRows === 0)
			throw new NotFoundException("Advert banner not found");

		return { message: "Advert bannner updated successfully" };
	}

	async getAdvertBanner(page: number, limit: number) {
		const offset = (Number(page) - 1) * Number(limit);

		return await this.adminRepository.getAdvertBanners(offset, limit);
	}

	async deleteAdvertBanner(bannerId: number) {
		const deletedAdvertBanner =
			await this.adminRepository.deleteAdvertBanner(bannerId);

		if (deletedAdvertBanner[0].affectedRows === 0)
			throw new NotFoundException("Advert banner not found");

		return { message: "Advert banner deleted successfully" };
	}

	async publishAdvertBanner(bannerId: number) {
		const publishedAdvertBanner =
			await this.adminRepository.publishAdvertBanner(bannerId);

		if (publishedAdvertBanner[0].affectedRows === 0)
			throw new NotFoundException("Advert banner not found");

		return { message: "Advert banner published successfully" };
	}

	async unpublishAdvertBanner(bannerId: number) {
		const unpublishedAdvertBanner =
			await this.adminRepository.unpublishAdvertBanner(bannerId);

		if (unpublishedAdvertBanner[0].affectedRows === 0)
			throw new NotFoundException("Advert banner not found");

		return { message: "Advert banner unpublished successfully" };
	}

	async createVRGameCategory(name: string, description?: string) {
		try {
			return await this.adminRepository.createVRGameCategory(name, description);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"VR game category with this name already exists",
				);
			}

			throw error;
		}
	}

	async updateVRGameCategory(id: number, name: string, description?: string) {
		try {
			const updatedVRGameCategory =
				await this.adminRepository.updateVRGameCategory(id, name, description);

			if (updatedVRGameCategory[0].affectedRows === 0) {
				throw new BadRequestException("VR game category not found");
			}

			return { message: "VR game category updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"VR game category with this name already exists",
				);
			}

			throw error;
		}
	}

	async deleteVRGameCategory(id: number) {
		const deletedVRGameCategory =
			await this.adminRepository.deleteVRGameCategory(id);

		if (deletedVRGameCategory[0].affectedRows === 0) {
			throw new BadRequestException("VR game category not found");
		}

		return { message: "VR game category deleted successfully" };
	}

	async getVRGameCategoryById(id: number) {
		const category = await this.adminRepository.getVRGameCategoryById(id);

		if (category.length === 0) {
			throw new BadRequestException("VR game category not found");
		}

		return category[0];
	}

	async getAllVRGameCategories(page: number, limit: number) {
		const offset = (page - 1) * limit;
		return await this.adminRepository.getAllVRGameCategories(offset, limit);
	}

	async createVRGame(gameData: CreateVRGameDto) {
		try {
			return await this.adminRepository.createVRGame(gameData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid category ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("VR game with this name already exists");
			}

			throw error;
		}
	}

	async updateVRGame(id: string, gameData: Partial<CreateVRGameDto>) {
		try {
			const updatedGame = await this.adminRepository.updateVRGame(id, gameData);

			if (updatedGame[0].affectedRows === 0) {
				throw new BadRequestException("VR game not found");
			}

			return { message: "VR game updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid category ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("VR game with this name already exists");
			}

			throw error;
		}
	}

	async deleteVRGame(id: string) {
		try {
			const deletedGame = await this.adminRepository.deleteVRGame(id);

			if (deletedGame[0].affectedRows === 0) {
				throw new BadRequestException("VR game not found");
			}

			return { message: "VR game deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async getVRGameById(id: string) {
		const game = await this.adminRepository.getVRGameById(id);

		if (game.length === 0) {
			throw new BadRequestException("VR game not found");
		}

		return game[0];
	}

	async getAllVRGames(page: number, limit: number) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllVrGames(offset, limit);
	}

	async makeVRGameAvailable(id: string) {
		const result = await this.adminRepository.makeVrGameAvailable(id);
		if (result[0].affectedRows === 0) {
			throw new BadRequestException("VR game not found or already available");
		}
		return { message: "VR game is now available" };
	}

	async makeVRGameUnavailable(id: string) {
		const result = await this.adminRepository.makeVrGameUnavailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException("VR game not found or already unavailable");
		}
		return { message: "VR game is now unavailable" };
	}
}
