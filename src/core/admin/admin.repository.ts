import { Injectable } from "@nestjs/common";
import { and, asc, desc, eq, gt, gte, inArray, like, sql } from "drizzle-orm";
import { DatabaseService } from "src/database/database.service";
import {
	advertBanners,
	cinemaMoviesGenres,
	equipmentCategories,
	foodAddonCategories,
	foodAddonsItems,
	foodCategories,
	vrgamesCategories,
} from "src/database/schema/categories";
import {
	cinemaHalls,
	cinemaMovies,
	cinemaMoviesShowtimes,
	cinemaMoviesToGenres,
	cinemas,
	CreateCinema,
	CreateCinemaHall,
	CreateCinemaMovie,
	CreateCinemaMovieShowtime,
	CreateEquipmentRentals,
	CreateFood,
	CreateHotel,
	CreateHotelAmenity,
	CreateHotelRoom,
	CreateMovieSnack,
	CreateSnack,
	CreateStudio,
	CreateStudioAvailability,
	CreateVRGame,
	CreateVRGameAvailability,
	equipmentRentals,
	equipmentRentalsBookings,
	foods,
	FoodToAddonsCategories,
	foodToAddonsCategories,
	foodToAddonsItems,
	FoodToAddonsItems,
	hotelAmenities,
	hotelRooms,
	hotels,
	hotelToAmenities,
	moviesSnacks,
	snacks,
	studioAvailability,
	studioBookings,
	studios,
	vrgames,
	vrgamesAvailability,
} from "src/database/schema/services";

export type StudioBookingStatus =
	| "pending"
	| "confirmed"
	| "cancelled"
	| "completed";

export type EquipmentRentalBookingStatus =
	| "pending"
	| "confirmed"
	| "cancelled"
	| "completed";

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

	async createVRGameCategory(name: string, description?: string) {
		const vrgameCategory = await this.databaseService.db
			.insert(vrgamesCategories)
			.values({
				name,
				description,
			})
			.$returningId();

		return vrgameCategory[0];
	}

	async updateVRGameCategory(id: number, name: string, description?: string) {
		const result = await this.databaseService.db
			.update(vrgamesCategories)
			.set({ name, description })
			.where(eq(vrgamesCategories.id, id));

		return result;
	}

	async deleteVRGameCategory(id: number) {
		const result = await this.databaseService.db
			.delete(vrgamesCategories)
			.where(eq(vrgamesCategories.id, id));
		return result;
	}

	async getVRGameCategoryById(id: number) {
		const category = await this.databaseService.db
			.select()
			.from(vrgamesCategories)
			.where(eq(vrgamesCategories.id, id));

		return category;
	}

	async getAllVRGameCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(vrgamesCategories)
			.limit(limit)
			.offset(offset);
		return categories;
	}

	async createVRGame(body: CreateVRGame) {
		const result = await this.databaseService.db
			.insert(vrgames)
			.values(body)
			.$returningId();

		return result[0];
	}

	async updateVRGame(id: string, vrgameData: Partial<CreateVRGame>) {
		const result = await this.databaseService.db
			.update(vrgames)
			.set(vrgameData)
			.where(eq(vrgames.id, id));

		return result;
	}

	async deleteVRGame(id: string) {
		const result = await this.databaseService.db
			.delete(vrgames)
			.where(eq(vrgames.id, id));

		return result;
	}

	async getVRGameById(id: string) {
		const vrgame = await this.databaseService.db
			.select()
			.from(vrgames)
			.where(eq(vrgames.id, id));

		return vrgame;
	}

	async getAllVrGames(offset: number, limit: number) {
		const vrgamesList = await this.databaseService.db
			.select()
			.from(vrgames)
			.limit(limit)
			.offset(offset);
		return vrgamesList;
	}

	async createVrgameAvailability(availabilities: CreateVRGameAvailability) {
		const result = await this.databaseService.db
			.insert(vrgamesAvailability)
			.values(availabilities)
			.$returningId();

		return result;
	}

	async removeVrgameAvailability(vrgameId: string, availabilityIds: string[]) {
		const result = await this.databaseService.db
			.delete(vrgamesAvailability)
			.where(
				and(
					eq(vrgamesAvailability.vrgameId, vrgameId),
					inArray(vrgamesAvailability.id, availabilityIds),
				),
			);

		return result;
	}

	async getVrgamesAvailabilityByVrgameId(vrgameId: string) {
		const availabilities = await this.databaseService.db
			.select()
			.from(vrgamesAvailability)
			.where(eq(vrgamesAvailability.vrgameId, vrgameId));

		return availabilities;
	}

	async checkVrgameAvailabilityConflict(vrgameId: string, dayOfWeek: number) {
		const conflict = await this.databaseService.db
			.select()
			.from(vrgamesAvailability)
			.where(
				and(
					eq(vrgamesAvailability.vrgameId, vrgameId),
					eq(vrgamesAvailability.dayOfWeek, dayOfWeek),
				),
			);

		return conflict.length > 0;
	}

	async makeVrGameAvailable(id: string) {
		const result = await this.databaseService.db
			.update(vrgames)
			.set({ isAvailable: true })
			.where(eq(vrgames.id, id));

		return result;
	}

	async makeVrGameUnavailable(id: string) {
		const result = await this.databaseService.db
			.update(vrgames)
			.set({ isAvailable: false })
			.where(eq(vrgames.id, id));

		return result;
	}

	async createHotelAmenities(amenities: CreateHotelAmenity[]) {
		const result = await this.databaseService.db
			.insert(hotelAmenities)
			.values(amenities)
			.$returningId();

		return result;
	}

	async updateHotelAmenity(id: number, data: Partial<CreateHotelAmenity>) {
		const result = await this.databaseService.db
			.update(hotelAmenities)
			.set(data)
			.where(eq(hotelAmenities.id, id));

		return result;
	}

	async deleteHotelAmenity(id: number) {
		const result = await this.databaseService.db
			.delete(hotelAmenities)
			.where(eq(hotelAmenities.id, id));

		return result;
	}

	async getAllHotelAmenities(offset: number, limit: number) {
		const amenities = await this.databaseService.db
			.select()
			.from(hotelAmenities)
			.limit(limit)
			.offset(offset);

		return amenities;
	}

	async createHotel(hotelData: CreateHotel) {
		return await this.databaseService.db
			.insert(hotels)
			.values(hotelData)
			.$returningId();
	}

	async updateHotel(id: string, hotelData: Partial<CreateHotel>) {
		const result = await this.databaseService.db
			.update(hotels)
			.set(hotelData)
			.where(eq(hotels.id, id));

		return result;
	}

	async createHotelRoom(roomData: CreateHotelRoom) {
		const result = await this.databaseService.db
			.insert(hotelRooms)
			.values(roomData)
			.$returningId();

		return result[0];
	}

	async updateHotelRoom(
		hotelId: string,
		roomId: string,
		roomData: Partial<CreateHotelRoom>,
	) {
		const result = await this.databaseService.db
			.update(hotelRooms)
			.set(roomData)
			.where(and(eq(hotelRooms.id, roomId), eq(hotelRooms.hotelId, hotelId)));

		return result;
	}

	async deleteHotelRoom(hotelId: string, roomId: string) {
		const result = await this.databaseService.db
			.delete(hotelRooms)
			.where(and(eq(hotelRooms.id, roomId), eq(hotelRooms.hotelId, hotelId)));

		return result;
	}

	async addHotelAmenities(amenities: { hotelId: string; amenityId: number }[]) {
		const result = await this.databaseService.db
			.insert(hotelToAmenities)
			.values(amenities)
			.$returningId();

		return result;
	}

	async removeHotelAmenities(hotelId: string, amenityIds: number[]) {
		const result = await this.databaseService.db
			.delete(hotelToAmenities)
			.where(
				and(
					eq(hotelToAmenities.hotelId, hotelId),
					inArray(hotelToAmenities.amenityId, amenityIds),
				),
			);

		return result;
	}

	async getHotelById(id: string) {
		const hotel = await this.databaseService.db.query.hotels.findFirst({
			where: eq(hotels.id, id),
			with: {
				amenities: {
					columns: {
						hotelId: false,
						amenityId: false,
						createdAt: false,
						updatedAt: false,
					},
					with: {
						amenity: {
							columns: {
								createdAt: false,
								updatedAt: false,
								iconPath: false,
							},
						},
					},
				},
				rooms: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
					},
				},
			},
		});

		const formattedHotel = hotel && {
			...hotel,
			amenities: hotel.amenities.map((a) => a.amenity),
		};

		return formattedHotel;
	}

	async getAllHotels(offset: number, limit: number, search?: string) {
		const hotelsList = await this.databaseService.db.query.hotels.findMany({
			where: search ? like(hotels.name, `%${search}%`) : undefined,
			with: {
				amenities: {
					columns: {
						hotelId: false,
						amenityId: false,
						createdAt: false,
						updatedAt: false,
					},
					with: {
						amenity: {
							columns: {
								createdAt: false,
								updatedAt: false,
								iconPath: false,
							},
						},
					},
				},
				rooms: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
					},
				},
			},
			limit,
			offset,
			orderBy: (hotel) => [desc(hotel.createdAt)],
		});

		return hotelsList.map((hotel) => ({
			...hotel,
			amenities: hotel.amenities.map((a) => a.amenity),
		}));
	}

	async deleteHotel(id: string) {
		const result = await this.databaseService.db
			.delete(hotels)
			.where(eq(hotels.id, id));

		return result;
	}

	async makeHotelRoomAvailable(hotelId: string, roomId: string) {
		const result = await this.databaseService.db
			.update(hotelRooms)
			.set({ isAvailable: true })
			.where(and(eq(hotelRooms.id, roomId), eq(hotelRooms.hotelId, hotelId)));

		return result;
	}

	async makeHotelRoomUnavailable(hotelId: string, roomId: string) {
		const result = await this.databaseService.db
			.update(hotelRooms)
			.set({ isAvailable: false })
			.where(and(eq(hotelRooms.id, roomId), eq(hotelRooms.hotelId, hotelId)));

		return result;
	}

	async makeHotelAvailable(id: string) {
		const result = await this.databaseService.db
			.update(hotels)
			.set({ isAvailable: true })
			.where(eq(hotels.id, id));

		return result;
	}

	async makeHotelUnavailable(id: string) {
		const result = await this.databaseService.db
			.update(hotels)
			.set({ isAvailable: false })
			.where(eq(hotels.id, id));

		return result;
	}

	async createEquipmentRentalCategories(
		categories: {
			name: string;
			description?: string;
			icon?: string;
			iconPath?: string;
		}[],
	) {
		return await this.databaseService.db
			.insert(equipmentCategories)
			.values(categories)
			.$returningId();
	}

	async updateEquipmentRentalCategory(
		id: number,
		data: {
			name?: string;
			description?: string;
			icon?: string;
			iconPath?: string;
		},
	) {
		return await this.databaseService.db
			.update(equipmentCategories)
			.set(data)
			.where(eq(equipmentCategories.id, id));
	}

	async deleteEquipmentRentalCategory(id: number) {
		return await this.databaseService.db
			.delete(equipmentCategories)
			.where(eq(equipmentCategories.id, id));
	}

	async getAllEquipmentRentalCategories(offset: number, limit: number) {
		return await this.databaseService.db
			.select()
			.from(equipmentCategories)
			.limit(limit)
			.offset(offset);
	}

	async createEquipmentRental(equipmentData: CreateEquipmentRentals) {
		const result = await this.databaseService.db
			.insert(equipmentRentals)
			.values(equipmentData)
			.$returningId();

		return result[0];
	}

	async updateEquipmentRental(
		id: string,
		equipmentData: Partial<CreateEquipmentRentals>,
	) {
		const result = await this.databaseService.db
			.update(equipmentRentals)
			.set(equipmentData)
			.where(eq(equipmentRentals.id, id));

		return result;
	}

	async deleteEquipmentRental(id: string) {
		const result = await this.databaseService.db
			.delete(equipmentRentals)
			.where(eq(equipmentRentals.id, id));

		return result;
	}

	async getEquipmentRentalById(id: string) {
		const equipment =
			await this.databaseService.db.query.equipmentRentals.findFirst({
				where: eq(equipmentRentals.id, id),
				with: {
					category: {
						columns: {
							createdAt: false,
							updatedAt: false,
						},
					},
				},
			});

		return equipment;
	}

	async getAllEquipmentRentals({
		offset,
		limit,
		categoryId,
	}: { offset: number; limit: number; categoryId?: number }) {
		const equipmentList =
			await this.databaseService.db.query.equipmentRentals.findMany({
				where: categoryId
					? eq(equipmentRentals.categoryId, categoryId)
					: undefined,
				columns: {
					categoryId: false,
					createdAt: false,
					updatedAt: false,
				},
				with: {
					category: {
						columns: {
							createdAt: false,
							updatedAt: false,
						},
					},
				},
				limit,
				offset,
				orderBy: (equipmentRentals) => [desc(equipmentRentals.createdAt)],
			});

		return equipmentList;
	}

	async makeEquipmentRentalAvailable(id: string) {
		const result = await this.databaseService.db
			.update(equipmentRentals)
			.set({ isAvailable: true })
			.where(eq(equipmentRentals.id, id));
		return result;
	}

	async makeEquipmentRentalUnavailable(id: string) {
		const result = await this.databaseService.db
			.update(equipmentRentals)
			.set({ isAvailable: false })
			.where(eq(equipmentRentals.id, id));

		return result;
	}

	async createMovieGenres(genres: { name: string; description?: string }[]) {
		return await this.databaseService.db
			.insert(cinemaMoviesGenres)
			.values(genres)
			.$returningId();
	}

	async updateMovieGenre(
		id: number,
		data: { name?: string; description?: string },
	) {
		return await this.databaseService.db
			.update(cinemaMoviesGenres)
			.set(data)
			.where(eq(cinemaMoviesGenres.id, id));
	}

	async deleteMovieGenre(id: number) {
		return await this.databaseService.db
			.delete(cinemaMoviesGenres)
			.where(eq(cinemaMoviesGenres.id, id));
	}

	async getAllMovieGenres(offset: number, limit: number) {
		return await this.databaseService.db
			.select()
			.from(cinemaMoviesGenres)
			.limit(limit)
			.offset(offset);
	}

	async createCinema(cinemaData: CreateCinema) {
		const result = await this.databaseService.db
			.insert(cinemas)
			.values(cinemaData)
			.$returningId();

		return result[0];
	}

	async updateCinema(id: string, cinemaData: Partial<CreateCinema>) {
		const result = await this.databaseService.db
			.update(cinemas)
			.set(cinemaData)
			.where(eq(cinemas.id, id));

		return result;
	}

	async deleteCinema(id: string) {
		const result = await this.databaseService.db
			.delete(cinemas)
			.where(eq(cinemas.id, id));

		return result;
	}

	async getCinemaById(id: string) {
		const cinema = await this.databaseService.db
			.select()
			.from(cinemas)
			.where(eq(cinemas.id, id));

		return cinema;
	}

	async getAllCinemas(offset: number, limit: number) {
		const cinemasList = await this.databaseService.db
			.select()
			.from(cinemas)
			.limit(limit)
			.offset(offset);
		return cinemasList;
	}

	async createCinemaHall(hallData: CreateCinemaHall) {
		const result = await this.databaseService.db
			.insert(cinemaHalls)
			.values(hallData)
			.$returningId();

		return result[0];
	}

	async updateCinemaHall(
		cinemaId: string,
		hallId: string,
		hallData: Partial<CreateCinemaHall>,
	) {
		const result = await this.databaseService.db
			.update(cinemaHalls)
			.set(hallData)
			.where(
				and(eq(cinemaHalls.id, hallId), eq(cinemaHalls.cinemaId, cinemaId)),
			);

		return result;
	}

	async deleteCinemaHall(cinemaId: string, hallId: string) {
		const result = await this.databaseService.db
			.delete(cinemaHalls)
			.where(
				and(eq(cinemaHalls.id, hallId), eq(cinemaHalls.cinemaId, cinemaId)),
			);

		return result;
	}

	async getCinemaHallById(hallId: string) {
		const hall = await this.databaseService.db
			.select()
			.from(cinemaHalls)
			.where(eq(cinemaHalls.id, hallId));

		return hall;
	}

	async getAllCinemaHallsByCinemaId(
		cinemaId: string,
		offset: number,
		limit: number,
	) {
		const hallsList = await this.databaseService.db
			.select()
			.from(cinemaHalls)
			.where(eq(cinemaHalls.cinemaId, cinemaId))
			.limit(limit)
			.offset(offset);
		return hallsList;
	}

	async getAllCinemaHalls(offset: number, limit: number) {
		const hallsList = await this.databaseService.db
			.select()
			.from(cinemaHalls)
			.limit(limit)
			.offset(offset);
		return hallsList;
	}

	async createCinemaMovie(movieData: CreateCinemaMovie) {
		const result = await this.databaseService.db
			.insert(cinemaMovies)
			.values(movieData)
			.$returningId();

		return result[0];
	}

	async updateCinemaMovie(id: string, movieData: Partial<CreateCinemaMovie>) {
		const result = await this.databaseService.db
			.update(cinemaMovies)
			.set(movieData)
			.where(eq(cinemaMovies.id, id));

		return result;
	}

	async deleteCinemaMovie(id: string) {
		const result = await this.databaseService.db
			.delete(cinemaMovies)
			.where(eq(cinemaMovies.id, id));
		return result;
	}

	async createSnacks(snackData: CreateSnack) {
		const result = await this.databaseService.db
			.insert(snacks)
			.values(snackData)
			.$returningId();

		return result[0];
	}

	async updateSnacks(id: number, snackData: Partial<CreateSnack>) {
		const result = await this.databaseService.db
			.update(snacks)
			.set(snackData)
			.where(eq(snacks.id, id));

		return result;
	}

	async deleteSnacks(id: number) {
		const result = await this.databaseService.db
			.delete(snacks)
			.where(eq(snacks.id, id));

		return result;
	}

	async getAllSnacks(offset: number, limit: number) {
		const snacksList = await this.databaseService.db
			.select()
			.from(snacks)
			.limit(limit)
			.offset(offset);

		return snacksList;
	}

	async AddSnacksToMovie(movieSnacks: CreateMovieSnack[]) {
		return await this.databaseService.db
			.insert(moviesSnacks)
			.values(movieSnacks)
			.$returningId();
	}

	async removeSnacksFromMovie(movieId: string, snackIds: number[]) {
		return await this.databaseService.db
			.delete(moviesSnacks)
			.where(
				and(
					eq(moviesSnacks.movieId, movieId),
					inArray(moviesSnacks.snackId, snackIds),
				),
			);
	}

	async getSnacksByMovieId(movieId: string) {
		const snacks = await this.databaseService.db.query.moviesSnacks.findMany({
			where: eq(moviesSnacks.movieId, movieId),
			with: {
				snack: {
					columns: {
						createdAt: false,
						updatedAt: false,
					},
				},
			},
		});

		return snacks.map((s) => s.snack);
	}

	async getCinemaMovieById(id: string) {
		const movie = await this.databaseService.db.query.cinemaMovies.findFirst({
			where: eq(cinemaMovies.id, id),
			with: {
				genres: {
					columns: {
						movieId: false,
						genreId: false,
						createdAt: false,
						updatedAt: false,
					},
					with: {
						genre: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
						},
					},
				},
			},
		});

		return movie
			? { ...movie, genres: movie.genres.map((g) => g.genre) }
			: null;
	}

	async getAllCinemaMovies({
		offset,
		limit,
		genreId,
	}: { offset: number; limit: number; genreId?: number }) {
		const moviesList =
			await this.databaseService.db.query.cinemaMovies.findMany({
				where: genreId
					? sql`EXISTS (SELECT 1 FROM cinema_movies_genres cmg WHERE cmg.movie_id = cinema_movies.id AND cmg.genre_id = ${genreId})`
					: undefined,
				columns: {
					createdAt: false,
					updatedAt: false,
				},
				with: {
					genres: {
						columns: {
							movieId: false,
							genreId: false,
							createdAt: false,
							updatedAt: false,
						},
						with: {
							genre: {
								columns: {
									createdAt: false,
									updatedAt: false,
								},
							},
						},
					},
				},
				limit,
				offset,
				orderBy: (movie) => [desc(movie.createdAt)],
			});

		return moviesList.map((movie) => ({
			...movie,
			genres: movie.genres.map((g) => g.genre),
		}));
	}

	async addMovieGenresToMovie(
		movieGenres: { movieId: string; genreId: number }[],
	) {
		return await this.databaseService.db
			.insert(cinemaMoviesToGenres)
			.values(movieGenres)
			.$returningId();
	}

	async removeMovieGenresFromMovie(movieId: string, genreIds: number[]) {
		return await this.databaseService.db
			.delete(cinemaMoviesToGenres)
			.where(
				and(
					eq(cinemaMoviesToGenres.movieId, movieId),
					inArray(cinemaMoviesToGenres.genreId, genreIds),
				),
			);
	}

	async createMovieShowtime(movieShowTime: CreateCinemaMovieShowtime) {
		const result = await this.databaseService.db
			.insert(cinemaMoviesShowtimes)
			.values(movieShowTime)
			.$returningId();

		return result[0];
	}

	async updateMovieShowtime(
		id: number,
		movieShowTime: Partial<CreateCinemaMovieShowtime>,
	) {
		const result = await this.databaseService.db
			.update(cinemaMoviesShowtimes)
			.set(movieShowTime)
			.where(eq(cinemaMoviesShowtimes.id, id));

		return result;
	}

	async deleteMovieShowtime(id: number) {
		const result = await this.databaseService.db
			.delete(cinemaMoviesShowtimes)
			.where(eq(cinemaMoviesShowtimes.id, id));

		return result;
	}

	async getMovieShowtimeById(id: number) {
		const showtime =
			await this.databaseService.db.query.cinemaMoviesShowtimes.findFirst({
				where: eq(cinemaMoviesShowtimes.id, id),
				with: {
					movie: {
						columns: {
							createdAt: false,
							updatedAt: false,
						},
						with: {
							genres: {
								columns: {
									movieId: false,
									genreId: false,
									createdAt: false,
									updatedAt: false,
								},
								with: {
									genre: {
										columns: {
											createdAt: false,
											updatedAt: false,
										},
									},
								},
							},
						},
					},
					cinemaHall: {
						columns: {
							createdAt: false,
							updatedAt: false,
							cinemaId: false,
						},
					},
				},
			});
		return showtime;
	}

	async makeMovieShowtimeAvailable(id: number) {
		const result = await this.databaseService.db
			.update(cinemaMoviesShowtimes)
			.set({ isAvailable: true })
			.where(eq(cinemaMoviesShowtimes.id, id));
		return result;
	}

	async makeMovieShowtimeUnavailable(id: number) {
		const result = await this.databaseService.db
			.update(cinemaMoviesShowtimes)
			.set({ isAvailable: false })
			.where(eq(cinemaMoviesShowtimes.id, id));

		return result;
	}

	async getMovieShowtimeByMovieId(
		movieId: string,
		offset: number,
		limit: number,
	) {
		const showtimes = await this.databaseService.db
			.select()
			.from(cinemaMoviesShowtimes)
			.where(eq(cinemaMoviesShowtimes.movieId, movieId))
			.limit(limit)
			.offset(offset);

		return showtimes;
	}

	async getUpcomingMovies(offset: number, limit: number) {
		const movies = await this.databaseService.db.query.cinemaMovies.findMany({
			where: inArray(
				cinemaMovies.id,
				this.databaseService.db
					.select({ movieId: cinemaMoviesShowtimes.movieId })
					.from(cinemaMoviesShowtimes)
					.where(gt(cinemaMoviesShowtimes.showDate, sql`CURDATE()`))
					.orderBy(cinemaMoviesShowtimes.showDate)
					.groupBy(cinemaMoviesShowtimes.movieId),
			),
			with: {
				genres: {
					columns: {
						movieId: false,
						genreId: false,
						createdAt: false,
						updatedAt: false,
					},
					with: {
						genre: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
						},
					},
				},
				cinema: {
					columns: {
						createdAt: false,
						updatedAt: false,
						countryId: false,
					},
				},
				showtimes: {
					columns: {
						createdAt: false,
						updatedAt: false,
						cinemaHallId: false,
						movieId: false,
					},
					limit: 4,
					orderBy: (showtime) => [
						asc(showtime.showDate),
						asc(showtime.showtime),
					],
					where: (showtime) => gt(showtime.showDate, sql`CURDATE()`),
				},
			},
			offset,
			limit,
		});

		return movies.map((movie) => ({
			...movie,
			genres: movie.genres.map((g) => g.genre),
		}));
	}

	async getMoviesByShowtime(
		currentDate: string,
		offset: number,
		limit: number,
	) {
		const movies = await this.databaseService.db.query.cinemaMovies.findMany({
			where: inArray(
				cinemaMovies.id,
				this.databaseService.db
					.select({ movieId: cinemaMoviesShowtimes.movieId })
					.from(cinemaMoviesShowtimes)
					.where(
						and(
							eq(
								sql`DATE(${cinemaMoviesShowtimes.showDate})`,
								sql`DATE(${currentDate})`,
							),
						),
					)
					.orderBy(cinemaMoviesShowtimes.showtime)
					.groupBy(cinemaMoviesShowtimes.movieId),
			),
			with: {
				genres: {
					columns: {
						movieId: false,
						genreId: false,
						createdAt: false,
						updatedAt: false,
					},
					with: {
						genre: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
						},
					},
				},
				cinema: {
					columns: {
						countryId: false,
						createdAt: false,
						updatedAt: false,
					},
				},
				showtimes: {
					columns: {
						createdAt: false,
						updatedAt: false,
						cinemaHallId: false,
						movieId: false,
					},
					limit: 4,
					orderBy: (showtime) => [
						asc(showtime.showDate),
						asc(showtime.showtime),
					],
					where: (showtime) =>
						gte(sql`DATE(${showtime.showDate})`, sql`CURDATE()`),
				},
			},
			offset,
			limit,
		});

		return movies.map((movie) => ({
			...movie,
			genres: movie.genres.map((g) => g.genre),
		}));
	}

	async createStudio(studioData: CreateStudio) {
		const result = await this.databaseService.db
			.insert(studios)
			.values(studioData)
			.$returningId();

		return result[0];
	}

	async updateStudio(id: number, studioData: Partial<CreateStudio>) {
		const result = await this.databaseService.db
			.update(studios)
			.set(studioData)
			.where(eq(studios.id, id));

		return result;
	}

	async deleteStudio(id: number) {
		const result = await this.databaseService.db
			.delete(studios)
			.where(eq(studios.id, id));

		return result;
	}

	async makeStudioAvailable(id: number) {
		const result = await this.databaseService.db
			.update(studios)
			.set({ isAvailable: true })
			.where(eq(studios.id, id));
		return result;
	}

	async makeStudioUnavailable(id: number) {
		const result = await this.databaseService.db
			.update(studios)
			.set({ isAvailable: false })
			.where(eq(studios.id, id));

		return result;
	}

	async getStudioById(id: number) {
		const studio = await this.databaseService.db
			.select()
			.from(studios)
			.where(eq(studios.id, id));

		return studio;
	}

	async getAllStudios(offset: number, limit: number) {
		const studiosList = await this.databaseService.db
			.select()
			.from(studios)
			.limit(limit)
			.offset(offset);
		return studiosList;
	}

	async createStudioAvailability(availabilities: CreateStudioAvailability) {
		const result = await this.databaseService.db
			.insert(studioAvailability)
			.values(availabilities)
			.$returningId();

		return result;
	}

	async removeStudioAvailability(studioId: number, availabilityIds: string[]) {
		const result = await this.databaseService.db
			.delete(studioAvailability)
			.where(
				and(
					eq(studioAvailability.studioId, studioId),
					inArray(studioAvailability.id, availabilityIds),
				),
			);

		return result;
	}

	async getStudioAvailabilityByStudioId(studioId: number) {
		const availabilities = await this.databaseService.db
			.select()
			.from(studioAvailability)
			.where(eq(studioAvailability.studioId, studioId));

		return availabilities;
	}

	async checkStudioAvailabilityConflict(studioId: number, dayOfWeek: number) {
		const conflict = await this.databaseService.db
			.select()
			.from(studioAvailability)
			.where(
				and(
					eq(studioAvailability.studioId, studioId),
					eq(studioAvailability.dayOfWeek, dayOfWeek),
				),
			);

		return conflict.length > 0;
	}

	async getStudioBookings({
		offset,
		limit,
		status,
	}: {
		offset: number;
		limit: number;
		status?: StudioBookingStatus;
	}) {
		const bookings =
			await this.databaseService.db.query.studioBookings.findMany({
				where: status ? eq(studioBookings.status, status) : undefined,
				columns: {
					createdAt: false,
					updatedAt: false,
					studioId: false,
				},
				limit,
				offset,
				orderBy: (booking) => [
					desc(booking.bookingDate),
					desc(booking.startTime),
				],
			});

		return bookings;
	}

	async getEquipmentRentalBookings({
		offset,
		limit,
		status,
	}: {
		offset: number;
		limit: number;
		status?: EquipmentRentalBookingStatus;
	}) {
		const bookings =
			await this.databaseService.db.query.equipmentRentalsBookings.findMany({
				where: status ? eq(equipmentRentalsBookings.status, status) : undefined,
				columns: {
					createdAt: false,
					updatedAt: false,
					equipmentRentalId: false,
				},
				limit,
				offset,
				orderBy: (booking) => [desc(booking.rentalStartDate)],
			});

		return bookings;
	}

	async getVrgamesTicketPurchases({
		offset,
		limit,
		status,
	}: {
		offset: number;
		limit: number;
		status?: "pending" | "completed" | "canceled";
	}) {
		const purchases =
			await this.databaseService.db.query.vrgamesTicketPurchases.findMany({
				where: (ticketPurchase) =>
					status ? eq(ticketPurchase.status, status) : undefined,
				columns: {
					createdAt: false,
					updatedAt: false,
					vrgameId: false,
				},
				limit,
				offset,
				orderBy: (purchase) => [desc(purchase.purchaseDate)],
			});

		return purchases;
	}

	async getMovieTicketPurchases({
		offset,
		limit,
		status,
	}: {
		offset: number;
		limit: number;
		status?: "pending" | "completed" | "canceled";
	}) {
		const purchases =
			await this.databaseService.db.query.moviesTicketPurchases.findMany({
				where: (table) => (status ? eq(table.status, status) : undefined),
				limit,
				offset,
				with: {
					orderedSnacks: {
						columns: {
							createdAt: false,
							updatedAt: false,
						},
						with: {
							snack: {
								columns: {
									createdAt: false,
									updatedAt: false,
								},
							},
						},
					},
				},
			});

		const ticketsWithSnacks = purchases.map((purchase) => {
			const { orderedSnacks, ...rest } = purchase;
			return {
				...rest,
				orderedSnacks: orderedSnacks.map((orderedSnack) => ({
					...orderedSnack,
					snack: orderedSnack.snack,
				})),
			};
		});

		return ticketsWithSnacks;
	}
}
