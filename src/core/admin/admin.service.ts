import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	AdminRepository,
	EquipmentRentalBookingStatus,
} from "./admin.repository";
import { CreateFood, CreateHotelAmenity } from "src/database/schema/services";
import { isDatabaseError, mysqlErrorCodes } from "src/common/mysql.error";
import {
	AddFoodAddonItems,
	CreateCinemaDto,
	CreateCinemaHallDto,
	CreateCinemaMovieDto,
	CreateEquipmentRentalDto,
	CreateHotelDto,
	CreateHotelRoomDto,
	CreateMovieShowtimeDto,
	CreateSnacksDto,
	CreateStudioAvailabilityDto,
	CreateStudioDto,
	CreateVrgameAvailabilityDto,
	CreateVRGameDto,
	UpdateCinemaDto,
	UpdateCinemaHallDto,
	UpdateCinemaMovieDto,
	UpdateEquipmentRentalDto,
	UpdateHotelAmenityDto,
	UpdateMovieShowtimeDto,
	UpdateSnacksDto,
	UpdateStudioDto,
} from "./dto/service.dto";
import {
	CreateEquipmentCategoriesDto,
	CreateMovieGenresDto,
	UpdateEquipmentCategoryDto,
	UpdateMovieGenreDto,
} from "./dto/category.dto";
import {
	CreateDeliverySettingsDto,
	UpdateDeliverySettingsDto,
} from "./dto/admin.dto";
import { CreateAdminNotification } from "src/database/schema";

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

	async getAllFoods(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllFoods(offset, limit, search);
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

	async getAllFoodCategories(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;
		return await this.adminRepository.getAllFoodCategories(
			offset,
			limit,
			search,
		);
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

	async getAllVRGameCategories(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;
		return await this.adminRepository.getAllVRGameCategories(
			offset,
			limit,
			search,
		);
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

	async createVrgameAvailability(
		availabilityData: CreateVrgameAvailabilityDto,
	) {
		try {
			const availabilities =
				await this.adminRepository.checkVrgameAvailabilityConflict(
					availabilityData.vrGameId,
					availabilityData.dayOfWeek,
				);

			if (availabilities) {
				throw new BadRequestException(
					"Vrgame availability for this day already exists",
				);
			}
			return await this.adminRepository.createVrgameAvailability({
				vrgameId: availabilityData.vrGameId,
				dayOfWeek: availabilityData.dayOfWeek,
				startTime: availabilityData.startTime,
				endTime: availabilityData.endTime,
			});
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid vrgame ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Vrgame availability for this date already exists",
				);
			}

			throw error;
		}
	}

	async removeVrgameAvailability(vrgameId: string, ids: string[]) {
		try {
			const deletedAvailabilities =
				await this.adminRepository.removeVrgameAvailability(vrgameId, ids);

			if (
				deletedAvailabilities &&
				deletedAvailabilities[0].affectedRows === 0
			) {
				throw new BadRequestException(
					"No matching vrgame availabilities found",
				);
			}

			return { message: "Vrgame availabilities removed successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Availability IDs");
			}

			throw error;
		}
	}

	async getVrgamesAvailabilitiesByVrgameId(vrgameId: string) {
		return await this.adminRepository.getVrgamesAvailabilityByVrgameId(
			vrgameId,
		);
	}

	async getAllVRGames(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllVrGames(offset, limit, search);
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

	async createHotelAmenities(amenities: CreateHotelAmenity[]) {
		try {
			return await this.adminRepository.createHotelAmenities(amenities);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more hotel amenities with these names already exist",
				);
			}

			throw error;
		}
	}

	async updateHotelAmenity(
		id: number,
		{ name, icon, iconPath }: UpdateHotelAmenityDto,
	) {
		try {
			const updatedHotelAmenity = await this.adminRepository.updateHotelAmenity(
				id,
				{ name, icon, iconPath },
			);

			if (updatedHotelAmenity[0].affectedRows === 0) {
				throw new BadRequestException("Hotel amenity not found");
			}

			return { message: "Hotel amenity updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Hotel amenity with this name already exists",
				);
			}

			throw error;
		}
	}

	async deleteHotelAmenity(id: number) {
		const deletedHotelAmenity =
			await this.adminRepository.deleteHotelAmenity(id);

		if (deletedHotelAmenity[0].affectedRows === 0) {
			throw new BadRequestException("Hotel amenity not found");
		}

		return { message: "Hotel amenity deleted successfully" };
	}

	async getAllHotelAmenities(page: number, limit: number) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllHotelAmenities(offset, limit);
	}

	async createHotel(hotelData: CreateHotelDto) {
		try {
			const hotel = {
				name: hotelData.name,
				description: hotelData.description,
				address: hotelData.address,
				imageUrls: hotelData.imageUrls,
				city: hotelData.city,
				country: hotelData.country,
				state: hotelData.state,
				coordinates: {
					lat: hotelData.latitude,
					lon: hotelData.longitude,
				},
			};

			return await this.adminRepository.createHotel(hotel);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Hotel with this name already exists");
			}

			throw error;
		}
	}

	async updateHotel(id: string, hotelData: Partial<CreateHotelDto>) {
		try {
			if (hotelData.latitude && hotelData.longitude) {
				//@ts-ignore
				hotelData["coordinates"] = {
					lat: hotelData.latitude,
					lon: hotelData.longitude,
				};
			}

			const updatedHotel = await this.adminRepository.updateHotel(
				id,
				hotelData,
			);

			if (updatedHotel[0].affectedRows === 0) {
				throw new BadRequestException("Hotel not found");
			}

			return { message: "Hotel updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Hotel with this name already exists");
			}

			throw error;
		}
	}

	async deleteHotel(id: string) {
		try {
			const deletedHotel = await this.adminRepository.deleteHotel(id);

			if (deletedHotel[0].affectedRows === 0) {
				throw new BadRequestException("Hotel not found");
			}

			return { message: "Hotel deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async createHotelRoom(hotelId: string, hotelRoom: CreateHotelRoomDto) {
		try {
			const hotelRoomData = {
				hotelId,
				...hotelRoom,
			};

			return await this.adminRepository.createHotelRoom(hotelRoomData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid hotel ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Hotel room with this name already exists",
				);
			}

			throw error;
		}
	}

	async updateHotelRoom(
		hotelId: string,
		roomId: string,
		hotelRoomData: Partial<CreateHotelRoomDto>,
	) {
		try {
			const updatedHotelRoom = await this.adminRepository.updateHotelRoom(
				hotelId,
				roomId,
				hotelRoomData,
			);

			if (updatedHotelRoom[0].affectedRows === 0) {
				throw new BadRequestException("Hotel room not found");
			}

			return { message: "Hotel room updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid hotel ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Hotel room with this name already exists",
				);
			}

			throw error;
		}
	}

	async deleteHotelRoom(hotelId: string, roomId: string) {
		try {
			const deletedHotelRoom = await this.adminRepository.deleteHotelRoom(
				hotelId,
				roomId,
			);

			if (deletedHotelRoom[0].affectedRows === 0) {
				throw new BadRequestException("Hotel room not found");
			}

			return { message: "Hotel room deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async addHotelAmenities(hotelId: string, amenityIds: number[]) {
		try {
			const hotel = await this.adminRepository.getHotelById(hotelId);

			if (!hotel) {
				throw new BadRequestException("Hotel not found");
			}

			const hotelAmenities = amenityIds.map((amenityId) => ({
				hotelId,
				amenityId,
			}));

			await this.adminRepository.addHotelAmenities(hotelAmenities);

			return { message: "Hotel amenities added successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Amenity IDs");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more hotel amenities with these IDs already exist for this hotel",
				);
			}

			throw error;
		}
	}

	async removeHotelAmenities(hotelId: string, amenityIds: number[]) {
		try {
			const deletedHotelAmenities =
				await this.adminRepository.removeHotelAmenities(hotelId, amenityIds);

			if (
				deletedHotelAmenities &&
				deletedHotelAmenities[0].affectedRows === 0
			) {
				throw new BadRequestException(
					"No matching amenities found for this hotel",
				);
			}

			return { message: "Hotel amenities removed successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Amenity IDs");
			}

			throw error;
		}
	}

	async getHotelById(id: string) {
		const hotel = await this.adminRepository.getHotelById(id);

		if (!hotel) {
			throw new BadRequestException("Hotel not found");
		}

		return hotel;
	}

	async getAllHotels(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllHotels(offset, limit, search);
	}

	async makeHotelRoomAvailable(hotelId: string, roomId: string) {
		const result = await this.adminRepository.makeHotelRoomAvailable(
			hotelId,
			roomId,
		);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException(
				"Hotel room not found or already available",
			);
		}

		return { message: "Hotel room is now available" };
	}

	async makeHotelRoomUnavailable(hotelId: string, roomId: string) {
		const result = await this.adminRepository.makeHotelRoomUnavailable(
			hotelId,
			roomId,
		);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException(
				"Hotel room not found or already unavailable",
			);
		}
		return { message: "Hotel room is now unavailable" };
	}

	async makeHotelAvailable(id: string) {
		const hotel = await this.adminRepository.getHotelById(id);

		if (hotel && !hotel.isAvailable) {
			// Ensure at least one room is available before making the hotel available
			const rooms = hotel.rooms || [];

			const hasAvailableRoom = rooms.some((room) => room.isAvailable);

			if (!hasAvailableRoom) {
				throw new BadRequestException(
					"Cannot make hotel available without at least one available room",
				);
			}
		}

		const result = await this.adminRepository.makeHotelAvailable(id);
		if (result[0].affectedRows === 0) {
			throw new BadRequestException("Hotel not found or already available");
		}
		return { message: "Hotel is now available" };
	}

	async makeHotelUnavailable(id: string) {
		const result = await this.adminRepository.makeHotelUnavailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException("Hotel not found or already unavailable");
		}
		return { message: "Hotel is now unavailable" };
	}

	async creaeteEquipmentRentalCategories(
		categoriesData: CreateEquipmentCategoriesDto,
	) {
		try {
			return await this.adminRepository.createEquipmentRentalCategories(
				categoriesData.categories,
			);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more equipment categories with these names already exist",
				);
			}

			throw error;
		}
	}

	async updateEquipmentRentalCategory(
		id: number,
		categoryData: UpdateEquipmentCategoryDto,
	) {
		try {
			const updatedEquipmentCategory =
				await this.adminRepository.updateEquipmentRentalCategory(
					id,
					categoryData,
				);

			if (updatedEquipmentCategory[0].affectedRows === 0) {
				throw new BadRequestException("Equipment category not found");
			}

			return { message: "Equipment category updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Equipment category with this name already exists",
				);
			}

			throw error;
		}
	}

	async deleteEquipmentRentalCategory(id: number) {
		const deletedEquipmentCategory =
			await this.adminRepository.deleteEquipmentRentalCategory(id);

		if (deletedEquipmentCategory[0].affectedRows === 0) {
			throw new BadRequestException("Equipment category not found");
		}

		return { message: "Equipment category deleted successfully" };
	}

	async getAllEquipmentRentalCategories(
		page: number,
		limit: number,
		search?: string,
	) {
		const offset = (page - 1) * limit;
		return await this.adminRepository.getAllEquipmentRentalCategories(
			offset,
			limit,
			search,
		);
	}

	async createEquipmentRental(equipmentData: CreateEquipmentRentalDto) {
		try {
			return await this.adminRepository.createEquipmentRental(equipmentData);
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
				throw new BadRequestException(
					"Equipment rental with this name already exists",
				);
			}

			throw error;
		}
	}

	async updateEquipmentRental(
		id: string,
		equipmentData: UpdateEquipmentRentalDto,
	) {
		try {
			const updatedEquipment = await this.adminRepository.updateEquipmentRental(
				id,
				equipmentData,
			);

			if (updatedEquipment[0].affectedRows === 0) {
				throw new BadRequestException("Equipment rental not found");
			}

			return { message: "Equipment rental updated successfully" };
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
				throw new BadRequestException(
					"Equipment rental with this name already exists",
				);
			}

			throw error;
		}
	}

	async deleteEquipmentRental(id: string) {
		try {
			const deletedEquipment =
				await this.adminRepository.deleteEquipmentRental(id);

			if (deletedEquipment[0].affectedRows === 0) {
				throw new BadRequestException("Equipment rental not found");
			}

			return { message: "Equipment rental deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async getEquipmentRentalById(id: string) {
		const equipment = await this.adminRepository.getEquipmentRentalById(id);

		if (!equipment) {
			throw new BadRequestException("Equipment rental not found");
		}

		return equipment;
	}

	async getAllEquipmentRentals({
		page,
		limit,
		categoryId,
		search,
	}: { page: number; limit: number; categoryId?: number; search?: string }) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllEquipmentRentals({
			offset,
			limit,
			categoryId,
			search,
		});
	}

	async makeEquipmentRentalAvailable(id: string) {
		const result = await this.adminRepository.makeEquipmentRentalAvailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException(
				"Equipment rental not found or already available",
			);
		}

		return { message: "Equipment rental is now available" };
	}

	async makeEquipmentRentalUnavailable(id: string) {
		const result =
			await this.adminRepository.makeEquipmentRentalUnavailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException(
				"Equipment rental not found or already unavailable",
			);
		}

		return { message: "Equipment rental is now unavailable" };
	}

	async createMovieGenres(genresData: CreateMovieGenresDto) {
		try {
			return await this.adminRepository.createMovieGenres(genresData.genres);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more movie genres with these names already exist",
				);
			}

			throw error;
		}
	}

	async updateMovieGenre(id: number, genre: UpdateMovieGenreDto) {
		try {
			const updatedMovieGenre = await this.adminRepository.updateMovieGenre(
				id,
				genre,
			);

			if (updatedMovieGenre[0].affectedRows === 0) {
				throw new BadRequestException("Movie genre not found");
			}

			return { message: "Movie genre updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Movie genre with this name already exists",
				);
			}

			throw error;
		}
	}

	async deleteMovieGenre(id: number) {
		const deletedMovieGenre = await this.adminRepository.deleteMovieGenre(id);

		if (deletedMovieGenre[0].affectedRows === 0) {
			throw new BadRequestException("Movie genre not found");
		}

		return { message: "Movie genre deleted successfully" };
	}

	async getAllMovieGenres(page: number, limit: number) {
		const offset = (page - 1) * limit;
		return await this.adminRepository.getAllMovieGenres(offset, limit);
	}

	async createCinema(movieData: CreateCinemaDto) {
		try {
			return await this.adminRepository.createCinema(movieData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid country ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Cinema with this name already exists");
			}

			throw error;
		}
	}

	async updateCinema(id: string, movieData: UpdateCinemaDto) {
		try {
			const updatedCinema = await this.adminRepository.updateCinema(
				id,
				movieData,
			);

			if (updatedCinema[0].affectedRows === 0) {
				throw new BadRequestException("Cinema not found");
			}

			return { message: "Cinema updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid country ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Cinema with this title already exists");
			}

			throw error;
		}
	}

	async deleteCinema(id: string) {
		try {
			const deletedCinema = await this.adminRepository.deleteCinema(id);

			if (deletedCinema[0].affectedRows === 0) {
				throw new BadRequestException("Cinema not found");
			}

			return { message: "Cinema deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async getCinemaById(id: string) {
		const cinema = await this.adminRepository.getCinemaById(id);

		if (cinema.length === 0) {
			throw new BadRequestException("Cinema not found");
		}

		return cinema;
	}

	async getAllCinemas(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllCinemas(offset, limit, search);
	}

	async createCinemaHall(hallData: CreateCinemaHallDto) {
		try {
			return await this.adminRepository.createCinemaHall(hallData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid cinema ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Cinema hall with this name already exists in this cinema",
				);
			}

			throw error;
		}
	}

	async updateCinemaHall(
		cinemaId: string,
		hallId: string,
		hallData: UpdateCinemaHallDto,
	) {
		try {
			const updatedCinemaHall = await this.adminRepository.updateCinemaHall(
				cinemaId,
				hallId,
				hallData,
			);

			if (updatedCinemaHall[0].affectedRows === 0) {
				throw new BadRequestException("Cinema hall not found");
			}

			return { message: "Cinema hall updated successfully" };
		} catch (error) {
			console.error(error);
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid cinema ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Cinema hall with this name already exists in this cinema",
				);
			}

			throw error;
		}
	}

	async deleteCinemaHall(cinemaId: string, hallId: string) {
		try {
			const deletedCinemaHall = await this.adminRepository.deleteCinemaHall(
				cinemaId,
				hallId,
			);

			if (deletedCinemaHall[0].affectedRows === 0) {
				throw new BadRequestException("Cinema hall not found");
			}

			return { message: "Cinema hall deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async getCinemaHallById(hallId: string) {
		const cinemaHall = await this.adminRepository.getCinemaHallById(hallId);

		if (cinemaHall.length === 0) {
			throw new BadRequestException("Cinema hall not found");
		}

		return cinemaHall;
	}

	async getAllCinemaHallsByCinemaId(
		cinemaId: string,
		page: number,
		limit: number,
	) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllCinemaHallsByCinemaId(
			cinemaId,
			offset,
			limit,
		);
	}

	async getAllCinemaHalls(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllCinemaHalls(offset, limit, search);
	}

	async createCinemaMovie(movieData: CreateCinemaMovieDto) {
		try {
			return await this.adminRepository.createCinemaMovie(movieData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid cinema ID or genre ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Cinema movie with this title already exists in this cinema",
				);
			}

			throw error;
		}
	}

	async updateCinemaMovie(id: string, movieData: UpdateCinemaMovieDto) {
		try {
			const updatedCinemaMovie = await this.adminRepository.updateCinemaMovie(
				id,
				movieData,
			);

			if (updatedCinemaMovie[0].affectedRows === 0) {
				throw new BadRequestException("Cinema movie not found");
			}

			return { message: "Cinema movie updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid cinema ID or genre ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Cinema movie with this title already exists in this cinema",
				);
			}

			throw error;
		}
	}

	async deleteCinemaMovie(id: string) {
		try {
			const deletedCinemaMovie =
				await this.adminRepository.deleteCinemaMovie(id);

			if (deletedCinemaMovie[0].affectedRows === 0) {
				throw new BadRequestException("Cinema movie not found");
			}

			return { message: "Cinema movie deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async createSnacks(snackData: CreateSnacksDto) {
		try {
			return await this.adminRepository.createSnacks(snackData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Snack with this name already exists");
			}

			throw error;
		}
	}

	async updateSnacks(id: number, snackData: UpdateSnacksDto) {
		try {
			const updatedSnack = await this.adminRepository.updateSnacks(
				id,
				snackData,
			);

			if (updatedSnack[0].affectedRows === 0) {
				throw new BadRequestException("Snack not found");
			}

			return { message: "Snack updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Snack with this name already exists");
			}

			throw error;
		}
	}

	async deleteSnacks(id: number) {
		try {
			const deletedSnack = await this.adminRepository.deleteSnacks(id);

			if (deletedSnack[0].affectedRows === 0) {
				throw new BadRequestException("Snack not found");
			}

			return { message: "Snack deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async getAllSnacks(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllSnacks(offset, limit, search);
	}

	async addSnacksToMovie(movieId: string, snackIds: number[]) {
		const snacks = snackIds.map((snackId) => ({
			movieId,
			snackId,
		}));

		try {
			await this.adminRepository.AddSnacksToMovie(snacks);

			return { message: "Snacks added to cinema movie successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Snack IDs");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more snacks with these IDs already exist for this movie",
				);
			}

			throw error;
		}
	}

	async removeSnacksFromMovie(movieId: string, snackIds: number[]) {
		try {
			const deletedSnacks = await this.adminRepository.removeSnacksFromMovie(
				movieId,
				snackIds,
			);

			if (deletedSnacks && deletedSnacks[0].affectedRows === 0) {
				throw new BadRequestException(
					"No matching snacks found for this cinema movie",
				);
			}

			return { message: "Snacks removed from cinema movie successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Snack IDs");
			}

			throw error;
		}
	}

	async getSnacksByMovieId(movieId: string) {
		return await this.adminRepository.getSnacksByMovieId(movieId);
	}

	async getCinemaMovieById(id: string) {
		const cinemaMovie = await this.adminRepository.getCinemaMovieById(id);

		if (!cinemaMovie) {
			throw new BadRequestException("Cinema movie not found");
		}

		return cinemaMovie;
	}

	async getAllCinemaMovies({
		genreId,
		page,
		limit,
		search,
	}: { genreId: number; page: number; limit: number; search?: string }) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllCinemaMovies({
			offset,
			limit,
			genreId,
			search,
		});
	}

	async addMovieGenresToCinemaMovie(movieId: string, genreIds: number[]) {
		try {
			const movies = genreIds.map((genreId) => ({
				movieId,
				genreId,
			}));

			await this.adminRepository.addMovieGenresToMovie(movies);

			return { message: "Movie genres added to cinema movie successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Genre IDs");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"One or more movie genres with these IDs already exist for this movie",
				);
			}

			throw error;
		}
	}

	async removeMovieGenresFromCinemaMovie(movieId: string, genreIds: number[]) {
		try {
			const deletedMovieGenres =
				await this.adminRepository.removeMovieGenresFromMovie(
					movieId,
					genreIds,
				);

			if (deletedMovieGenres && deletedMovieGenres[0].affectedRows === 0) {
				throw new BadRequestException(
					"No matching genres found for this cinema movie",
				);
			}

			return { message: "Movie genres removed from cinema movie successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Genre IDs");
			}

			throw error;
		}
	}

	async createMovieShowtime(showtimeData: CreateMovieShowtimeDto) {
		try {
			return await this.adminRepository.createMovieShowtime(showtimeData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException(
					"Invalid cinema ID, hall ID, or movie ID",
				);
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Showtime with this time already exists in this hall",
				);
			}

			throw error;
		}
	}

	async updateMovieShowtime(id: number, showtimeData: UpdateMovieShowtimeDto) {
		try {
			const updatedShowtime = await this.adminRepository.updateMovieShowtime(
				id,
				showtimeData,
			);

			if (updatedShowtime[0].affectedRows === 0) {
				throw new BadRequestException("Movie showtime not found");
			}

			return { message: "Movie showtime updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException(
					"Invalid cinema ID, hall ID, or movie ID",
				);
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Showtime with this time already exists in this hall",
				);
			}

			throw error;
		}
	}

	async deleteMovieShowtime(id: number) {
		try {
			const deletedShowtime =
				await this.adminRepository.deleteMovieShowtime(id);

			if (deletedShowtime[0].affectedRows === 0) {
				throw new BadRequestException("Movie showtime not found");
			}

			return { message: "Movie showtime deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async makeMovieShowtimeAvailable(id: number) {
		const showtime = await this.adminRepository.getMovieShowtimeById(id);

		if (showtime && !showtime.isAvailable) {
			// Ensure the associated movie is available before making the showtime available
			const movie = showtime?.movie;

			if (!movie) {
				throw new BadRequestException(
					"Cannot make showtime available for an unavailable movie",
				);
			}
		}
		const movieGenres =
			showtime?.movie.genres.map((genre) => genre.genre) || [];

		if (movieGenres.length === 0) {
			throw new BadRequestException(
				"Cannot make showtime available for a movie without genres",
			);
		}

		const result = await this.adminRepository.makeMovieShowtimeAvailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException(
				"Movie showtime not found or already available",
			);
		}

		return { message: "Movie showtime is now available" };
	}

	async makeMovieShowtimeUnavailable(id: number) {
		const result = await this.adminRepository.makeMovieShowtimeUnavailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException(
				"Movie showtime not found or already unavailable",
			);
		}
		return { message: "Movie showtime is now unavailable" };
	}

	async getMovieShowtimeByMovieId(id: string, page: number, limit: number) {
		const offset = (page - 1) * limit;

		const showtime = await this.adminRepository.getMovieShowtimeByMovieId(
			id,
			offset,
			limit,
		);

		if (!showtime) {
			throw new BadRequestException("Movie showtime not found");
		}

		return showtime;
	}

	async getUpcomingMovies(page: number, limit: number) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getUpcomingMovies(offset, limit);
	}

	async getMoviesByShowtime(currentDate: string, page: number, limit: number) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getMoviesByShowtime(
			currentDate,
			offset,
			limit,
		);
	}

	async createStudio(studioData: CreateStudioDto) {
		try {
			return await this.adminRepository.createStudio(studioData);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Studio with this name already exists");
			}

			throw error;
		}
	}

	async updateStudio(id: number, studioData: UpdateStudioDto) {
		try {
			const updatedStudio = await this.adminRepository.updateStudio(
				id,
				studioData,
			);

			if (updatedStudio[0].affectedRows === 0) {
				throw new BadRequestException("Studio not found");
			}

			return { message: "Studio updated successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException("Studio with this name already exists");
			}

			throw error;
		}
	}

	async deleteStudio(id: number) {
		try {
			const deletedStudio = await this.adminRepository.deleteStudio(id);

			if (deletedStudio[0].affectedRows === 0) {
				throw new BadRequestException("Studio not found");
			}

			return { message: "Studio deleted successfully" };
		} catch (error) {
			throw error;
		}
	}

	async makeStudioAvailable(id: number) {
		const studioAvailability =
			await this.adminRepository.getStudioAvailabilityByStudioId(id);

		if (studioAvailability.length === 0) {
			throw new BadRequestException(
				"Cannot make studio available without availability schedule",
			);
		}

		const result = await this.adminRepository.makeStudioAvailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException("Studio not found or already available");
		}

		return { message: "Studio is now available" };
	}

	async makeStudioUnavailable(id: number) {
		const result = await this.adminRepository.makeStudioUnavailable(id);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException("Studio not found or already unavailable");
		}

		return { message: "Studio is now unavailable" };
	}

	async getAllStudios(page: number, limit: number, search?: string) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllStudios(offset, limit, search);
	}

	async createStudioAvailability(
		availabilityData: CreateStudioAvailabilityDto,
	) {
		try {
			const availabilities =
				await this.adminRepository.checkStudioAvailabilityConflict(
					availabilityData.studioId,
					availabilityData.dayOfWeek,
				);

			if (availabilities) {
				throw new BadRequestException(
					"Studio availability for this day already exists",
				);
			}
			return await this.adminRepository.createStudioAvailability(
				availabilityData,
			);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("Invalid studio ID");
			}

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			) {
				throw new BadRequestException(
					"Studio availability for this date already exists",
				);
			}

			throw error;
		}
	}

	async removeStudioAvailability(studioId: number, ids: string[]) {
		try {
			const deletedAvailabilities =
				await this.adminRepository.removeStudioAvailability(studioId, ids);

			if (
				deletedAvailabilities &&
				deletedAvailabilities[0].affectedRows === 0
			) {
				throw new BadRequestException(
					"No matching studio availabilities found",
				);
			}

			return { message: "Studio availabilities removed successfully" };
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			) {
				throw new BadRequestException("One or more invalid Availability IDs");
			}

			throw error;
		}
	}

	async getStudioAvailabilitiesByStudioId(studioId: number) {
		return await this.adminRepository.getStudioAvailabilityByStudioId(studioId);
	}

	async getStudioBookings({
		page,
		limit,
		status,
		search,
	}: {
		page: number;
		limit: number;
		status?: "scheduled" | "cancelled" | "completed";
		search?: string;
	}) {
		const offset = (page - 1) * limit;

		const studioBookings = await this.adminRepository.getStudioBookings({
			offset,
			limit,
			status,
			search,
		});

		return {
			studioBookings,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: studioBookings.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async getEquipmentRentalBookings({
		page,
		limit,
		status,
		search,
	}: {
		page: number;
		limit: number;
		status?: EquipmentRentalBookingStatus;
		search?: string;
	}) {
		const offset = (page - 1) * limit;

		const equipmentRentalBookings =
			await this.adminRepository.getEquipmentRentalBookings({
				offset,
				limit,
				status,
				search,
			});

		return {
			equipmentRentalBookings,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: equipmentRentalBookings.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async getVrgamesTicketPurchases({
		page,
		limit,
		status,
		search,
	}: {
		page: number;
		limit: number;
		status?: "completed" | "cancelled";
		search?: string;
	}) {
		const offset = (page - 1) * limit;

		const vrgameTickets = await this.adminRepository.getVrgamesTicketPurchases({
			offset,
			limit,
			status,
			search,
		});

		return {
			vrgameTickets,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: vrgameTickets.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async getMovieTicketPurchases({
		page,
		limit,
		status,
		search,
	}: {
		page: number;
		limit: number;
		status?: "completed" | "cancelled";
		search?: string;
	}) {
		const offset = (page - 1) * limit;

		const movieTickets = await this.adminRepository.getMovieTicketPurchases({
			offset,
			limit,
			status,
			search,
		});

		return {
			movieTickets,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: movieTickets.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async getHotelBookings({
		page,
		limit,
		status,
		search,
	}: {
		page: number;
		limit: number;
		status?: "confirmed" | "cancelled" | "completed";
		search?: string;
	}) {
		const offset = (page - 1) * limit;

		const hotelBookings = await this.adminRepository.getHotelBookings({
			offset,
			limit,
			status,
			search,
		});

		return {
			hotelBookings,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: hotelBookings.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async getAllUsers(page: number, limit = 10, search?: string) {
		const offset = (page - 1) * limit;

		return await this.adminRepository.getAllUsers(offset, limit, search);
	}

	async getAllFoodOrders({
		page,
		limit,
		status,
		search,
	}: {
		page: number;
		limit: number;
		status?:
			| "preparing"
			| "delivered"
			| "cancelled"
			| "on-the-way"
			| "confirmed";
		search?: string;
	}) {
		const offset = (page - 1) * limit;

		const foodOrders = await this.adminRepository.getAllFoodOrders({
			offset,
			limit,
			status,
			search,
		});

		return {
			foodOrders,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: foodOrders.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async getDashboardStats() {
		return await this.adminRepository.getDashboardStats();
	}

	async createAdminDeliverySetting(
		deliverySettingData: CreateDeliverySettingsDto,
	) {
		try {
			const existingSetting = await this.adminRepository.getDeliverySetting();

			if (existingSetting) {
				throw new BadRequestException("Delivery setting already exists");
			}

			return await this.adminRepository.createDeliverySetting(
				deliverySettingData,
			);
		} catch (error) {
			throw error;
		}
	}

	async updateAdminDeliverySetting(
		id: number,
		deliverySettingData: UpdateDeliverySettingsDto,
	) {
		try {
			const updatedSetting = await this.adminRepository.updateDeliverySetting(
				id,
				deliverySettingData,
			);

			if (updatedSetting[0].affectedRows === 0) {
				throw new BadRequestException("Delivery setting not found");
			}

			return { message: "Delivery setting updated successfully" };
		} catch (error) {
			throw error;
		}
	}

	async getAdminDeliverySetting() {
		const setting = await this.adminRepository.getDeliverySetting();

		if (!setting) {
			throw new BadRequestException("Delivery setting not found");
		}

		return setting;
	}

	async updateFoodOrderStatus(
		orderId: string,
		status: "preparing" | "on-the-way" | "delivered" | "cancelled",
	) {
		const foodOrder = await this.adminRepository.getFoodOrderById(orderId);

		if (!foodOrder) {
			throw new BadRequestException("Food order not found");
		}

		if (foodOrder.status === "delivered" || foodOrder.status === "cancelled") {
			throw new BadRequestException(
				"Cannot update status of delivered or cancelled orders",
			);
		}

		if (foodOrder.status === status) {
			throw new BadRequestException(
				`Food order is already marked as ${status}`,
			);
		}

		if (foodOrder.status === "on-the-way" && status === "preparing") {
			throw new BadRequestException(
				`Cannot change status from on-the-way back to preparing`,
			);
		}

		const updatedOrder = await this.adminRepository.updateFoodOrderStatus(
			orderId,
			status,
		);

		if (updatedOrder[0].affectedRows === 0) {
			throw new BadRequestException("Food order not found or status unchanged");
		}

		return { message: "Food order status updated successfully" };
	}

	async updateEquipmentRentalBookingStatus(
		bookingId: string,
		status: EquipmentRentalBookingStatus,
	) {
		try {
			const booking =
				await this.adminRepository.getEquipmentRentalBookingById(bookingId);

			if (!booking) {
				throw new BadRequestException("Equipment rental booking not found");
			}

			if (booking.status === status) {
				throw new BadRequestException(
					`Equipment rental booking is already marked as ${status}`,
				);
			}

			const updatedBooking =
				await this.adminRepository.updateEquipmentRentalBookingStatus(
					bookingId,
					status,
				);

			if (updatedBooking[0].affectedRows === 0) {
				throw new BadRequestException(
					"Equipment rental booking not found or status unchanged",
				);
			}

			return {
				message: "Equipment rental booking status updated successfully",
			};
		} catch (error) {
			throw error;
		}
	}

	async getAllOrders(page: number, limit: number) {
		const offset = (page - 1) * limit;

		const orders = await this.adminRepository.getAllOrders(offset, limit);

		return {
			orders,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: orders.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async createAdminNotification(notificationData: CreateAdminNotification[]) {
		return await this.adminRepository.createAdminNotification(notificationData);
	}

	async getReadAdminNotifications(page: number, limit: number) {
		const offset = (page - 1) * limit;

		const notifications = await this.adminRepository.getReadAdminNotifications(
			offset,
			limit,
		);

		return {
			notifications,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: notifications.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async getUnreadAdminNotifications(page: number, limit: number) {
		const offset = (page - 1) * limit;
		const notifications =
			await this.adminRepository.getUnreadAdminNotifications(offset, limit);

		return {
			notifications,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: notifications.length === limit ? page + 1 : null,
			perPage: limit,
		};
	}

	async markNotificationAsRead(notificationId: number) {
		const result =
			await this.adminRepository.markNotificationAsRead(notificationId);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException("Notification not found or already read");
		}

		return { message: "Notification marked as read successfully" };
	}

	async getAdminsEmails() {
		return await this.adminRepository.getAdminsEmails();
	}

	async servicesSubscriptionMonthlyStats(year: number) {
		return await this.adminRepository.servicesSubscriptionMonthlyStats(year);
	}

	async getMonthlyRevenueStats(year: number) {
		return await this.adminRepository.getMonthlyRevenueStats(year);
	}

	async markMovieTicketPurchaseAsUsed(ticketId: string) {
		const result =
			await this.adminRepository.markMovieTicketPurchaseAsUsed(ticketId);

		if (result[0].affectedRows === 0) {
			throw new BadRequestException(
				"Movie ticket purchase not found or already used",
			);
		}

		return { message: "Movie ticket purchase marked as used successfully" };
	}

	async updateHotelBookingStatus(
		bookingId: string,
		status: "cancelled" | "completed",
	) {
		try {
			const booking = await this.adminRepository.getHotelBookingById(bookingId);

			if (!booking) {
				throw new BadRequestException("Hotel booking not found");
			}

			if (booking.status === status) {
				throw new BadRequestException(
					`Hotel booking is already marked as ${status}`,
				);
			}

			const updatedBooking =
				await this.adminRepository.updateHotelBookingStatus(bookingId, status);

			if (updatedBooking[0].affectedRows === 0) {
				throw new BadRequestException(
					"Hotel booking not found or status unchanged",
				);
			}

			return { message: "Hotel booking status updated successfully" };
		} catch (error) {
			throw error;
		}
	}
}
