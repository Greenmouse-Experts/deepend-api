import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Put,
	Query,
	UseGuards,
	UsePipes,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "src/common/decorators/role/role.decorator";
import { UserRoles } from "src/common/decorators/role/role.enum";
import {
	BookingPaginationQueryDto,
	BookingPaginationQuerySchema,
	EquipmentPaginationQueryDto,
	EquipmentPaginationQuerySchema,
	FoodOrderPaginationQueryDto,
	FoodOrderPaginationQuerySchema,
	MoviePaginationQueryDto,
	MoviePaginationQuerySchema,
	MovieShowtimePaginationQueryDto,
	MovieShowtimePaginationQuerySchema,
	PaginationQueryDto,
	PaginationQuerySchema,
	ServicePaginationQueryDto,
	ServicePaginationQuerySchema,
	StudioSessionPaginationQueryDto,
	StudioSessionPaginationQuerySchema,
	TicketPaginationQueryDto,
	TicketPaginationQuerySchema,
	UserPaginationQueryDto,
	UserPaginationQuerySchema,
	YearQueryDto,
	YearQuerySchema,
} from "src/common/dto/requestQuery.dto";
import { AuthGuard } from "src/common/guards/auth.guard";
import { QueryJoiValidationPipe } from "src/common/pipes/query-validation.pipe";
import { JoiValidationPipe } from "src/common/pipes/validation.pipe";
import { AdminService } from "./admin.service";
import {
	CreateEquipmentCategoriesDto,
	CreateEquipmentCategoriesSchema,
	CreateFoodAddonCategories,
	CreateFoodAddonCategoriesSchema,
	CreateFoodAddonItemsDto,
	CreateFoodAddonItemsSchema,
	CreateFoodCategoryDto,
	CreateFoodCategorySchema,
	CreateMovieGenresDto,
	CreateMovieGenresSchema,
	CreateVrGameCategoryDto,
	CreateVrGameCategorySchema,
	UpdateEquipmentCategoryDto,
	UpdateEquipmentCategorySchema,
	UpdateFoodAddonCategoryDto,
	UpdateFoodAddonCategorySchema,
	UpdateFoodAddonItemDto,
	UpdateFoodAddonItemSchema,
	UpdateFoodCategoryDto,
	UpdateMovieGenreDto,
	UpdateMovieGenreSchema,
	UpdateVrGameCategoryDto,
	UpdateVrGameCategorySchema,
} from "./dto/category.dto";
import {
	AddFoodAddonItemsSchema,
	AddFoodAddonsDto,
	AddHotelAmenitiesDto,
	AddHotelAmenitiesSchema,
	AddMovieGenresToMovieDto,
	AddMovieGenresToMovieSchema,
	CreateAdvertBannerDto,
	CreateAdvertBannerSchema,
	CreateCinemaDto,
	CreateCinemaHallDto,
	CreateCinemaHallSchema,
	CreateCinemaMovieDto,
	CreateCinemaMovieSchema,
	CreateCinemaSchema,
	CreateEquipmentRentalDto,
	CreateEquipmentRentalSchema,
	CreateFoodDto,
	CreateFoodSchema,
	CreateHotelAmenitiesDto,
	CreateHotelAmenitiesSchema,
	CreateHotelDto,
	CreateHotelRoomDto,
	CreateHotelRoomSchema,
	CreateHotelSchema,
	CreateMovieShowtimeDto,
	CreateMovieShowtimeSchema,
	CreateSnacksDto,
	CreateSnacksSchema,
	CreateStudioAvailabilityDto,
	CreateStudioAvailabilitySchema,
	CreateStudioDto,
	CreateStudioSchema,
	CreateVrgameAvailabilityDto,
	CreateVrgameAvailabilitySchema,
	CreateVRGameDto,
	CreateVRGameSchema,
	MovieSnacksIdsDto,
	MovieSnacksIdsSchema,
	RemoveFoodAddonCategoryDto,
	RemoveFoodAddonCategorySchema,
	RemoveFoodAddonItemsDto,
	RemoveFoodAddonItemsSchema,
	RemoveHotelAmenitiesDto,
	RemoveHotelAmenitiesSchema,
	RemoveMovieGenresFromMovieDto,
	RemoveMovieGenresFromMovieSchema,
	RemoveStudioAvailabilityDto,
	RemoveStudioAvailabilitySchema,
	RemoveVrgameAvailabilityDto,
	UpdateAdvertBannerDto,
	UpdateAdvertBannerSchema,
	UpdateCinemaDto,
	UpdateCinemaHallDto,
	UpdateCinemaHallSchema,
	UpdateCinemaMovieDto,
	UpdateCinemaMovieSchema,
	UpdateCinemaSchema,
	UpdateEquipmentRentalDto,
	UpdateEquipmentRentalSchema,
	UpdateFoodDto,
	UpdateFoodSchema,
	UpdateHotelAmenityDto,
	UpdateHotelAmenitySchema,
	UpdateHotelDto,
	UpdateHotelRoomDto,
	UpdateHotelRoomSchema,
	UpdateHotelSchema,
	UpdateMovieShowtimeDto,
	UpdateMovieShowtimeSchema,
	UpdateSnacksDto,
	UpdateSnacksSchema,
	UpdateStudioDto,
	UpdateStudioSchema,
	UpdateVRGameDto,
	UpdateVRGameSchema,
} from "./dto/service.dto";
import {
	CreateDeliverySettingsDto,
	DeliverySettingsSchema,
	UpdateDeliverySettingsDto,
	UpdateDeliverySettingsSchema,
	UpdateEquipmentOrderStatusDto,
	UpdateEquipmentOrderStatusSchema,
	UpdateFoodOrderStatusDto,
	UpdateFoodOrderStatusSchema,
} from "./dto/admin.dto";

@ApiTags("Admin")
@Controller({ path: "admins", version: "1" })
@UseGuards(AuthGuard) // Ensure the user is authenticated
@Role(UserRoles.Admin) // Only admin can access these routes
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Post("foods")
	@ApiOperation({ summary: "Create a new food item" })
	@ApiBody({ type: CreateFoodDto })
	@UsePipes(new JoiValidationPipe(CreateFoodSchema))
	async createFood(@Body() body: CreateFoodDto) {
		return await this.adminService.createFood(body);
	}

	@Put("foods/:id")
	@ApiOperation({ summary: "Update an existing food item" })
	@ApiBody({ type: UpdateFoodDto })
	@UsePipes(new JoiValidationPipe(UpdateFoodSchema))
	async updateFood(@Param("id") id: string, @Body() body: UpdateFoodDto) {
		return await this.adminService.updateFood(id, body);
	}

	@Delete("foods/:id")
	@ApiOperation({ summary: "Delete a food item" })
	async deleteFood(@Param("id") id: string) {
		return await this.adminService.deleteFood(id);
	}

	@Get("foods/categories")
	@ApiOperation({ summary: "Get all food categories" })
	async getAllFoodCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllFoodCategories(+page, +limit);
	}

	@Get("foods/orders")
	@ApiOperation({ summary: "Get all food orders with pagination" })
	async getAllFoodOrders(
		@Query(new QueryJoiValidationPipe(FoodOrderPaginationQuerySchema))
		{ page, limit, status, search }: FoodOrderPaginationQueryDto,
	) {
		return await this.adminService.getAllFoodOrders({
			page,
			limit,
			status,
			search,
		});
	}

	@Get("foods/:id")
	@ApiOperation({ summary: "Get a food item by ID" })
	async getFoodById(@Param("id") id: string) {
		return await this.adminService.getFoodById(id);
	}

	@Get("foods")
	@ApiOperation({ summary: "Get all food items with pagination" })
	async getAllFoods(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllFoods(+page, limit);
	}

	@Post("foods/categories")
	@ApiOperation({ summary: "Create a new food category" })
	@UsePipes(new JoiValidationPipe(CreateFoodCategorySchema))
	async createFoodCategory(@Body() body: CreateFoodCategoryDto) {
		return await this.adminService.createFoodCategory(
			body.name,
			body.description,
			body.icon,
		);
	}

	@Put("foods/categories/:id")
	@ApiOperation({ summary: "Update an existing food category" })
	@UsePipes(new JoiValidationPipe(CreateFoodCategorySchema))
	async updateFoodCategory(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: CreateFoodCategoryDto,
	) {
		return await this.adminService.updateFoodCategory(
			id,
			body.name,
			body.description,
		);
	}

	@Delete("foods/categories/:id")
	@ApiOperation({ summary: "Delete a food category" })
	async deleteFoodCategory(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteFoodCategory(id);
	}

	@Post("foods/addons/categories")
	@ApiOperation({ summary: "Create new food addon categories" })
	@ApiBody({ type: CreateFoodAddonCategories })
	@UsePipes(new JoiValidationPipe(CreateFoodAddonCategoriesSchema))
	async createFoodAddonCategories(@Body() body: CreateFoodAddonCategories) {
		return await this.adminService.createFoodAddonCategories(body.addons);
	}

	@Put("foods/addons/categories/:id")
	@ApiOperation({ summary: "Update an existing food addon category" })
	@ApiBody({ type: UpdateFoodAddonCategoryDto })
	@UsePipes(new JoiValidationPipe(UpdateFoodAddonCategorySchema))
	async updateFoodAddonCategory(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: UpdateFoodCategoryDto,
	) {
		return await this.adminService.updateFoodAddonCategory(
			id,
			body.name,
			body.description,
		);
	}

	@Delete("foods/addons/categories/:id")
	@ApiOperation({ summary: "Delete a food addon category" })
	async deleteFoodAddonCategory(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteFoodAddonCategory(id);
	}

	@Get("foods/addons/categories")
	@ApiOperation({ summary: "Get all food addon categories" })
	async getAllFoodAddonCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllFoodAddonCategories(+page, +limit);
	}

	@Post("foods/addons/items")
	@ApiOperation({ summary: "Create new food addon items" })
	@ApiBody({ type: CreateFoodAddonItemsDto })
	@UsePipes(new JoiValidationPipe(CreateFoodAddonItemsSchema))
	async createFoodAddonItems(@Body() body: CreateFoodAddonItemsDto) {
		return await this.adminService.createFoodAddonItems(body.addonItems);
	}

	@Put("foods/addons/items/:id")
	@ApiOperation({ summary: "Update an existing food addon item" })
	@ApiBody({ type: UpdateFoodAddonItemDto })
	@UsePipes(new JoiValidationPipe(UpdateFoodAddonItemSchema))
	async updateFoodAddonItem(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: UpdateFoodAddonItemDto,
	) {
		return await this.adminService.updateFoodAddonItem(id, {
			name: body.name,
			price: body.price,
			categoryId: body.categoryId,
		});
	}

	@Delete("foods/addons/items/:id")
	@ApiOperation({ summary: "Delete a food addon item" })
	async deleteFoodAddonItem(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteFoodAddonItem(id);
	}

	@Get("foods/addons/categories/:categoryId/items")
	@ApiOperation({
		summary: "Get all food addon items by category ID with pagination",
	})
	async getFoodAddonItemsByCategoryId(
		@Param("categoryId", ParseIntPipe) categoryId: number,
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllFoodAddonItemsByCategory(
			categoryId,
			page,
			limit,
		);
	}

	@Post("foods/:foodId/addons")
	@ApiOperation({ summary: "Associate a food addon with a food item" })
	@UsePipes(new JoiValidationPipe(AddFoodAddonItemsSchema))
	async addFoodAddons(
		@Param("foodId") foodId: string,
		@Body() body: AddFoodAddonsDto,
	) {
		return await this.adminService.addFoodAddons({
			foodId,
			addons: body.addons,
		});
	}

	@Delete("foods/:foodId/addons/categories")
	@ApiOperation({
		summary: "Remove an associated food addon categories from a food item",
	})
	@UsePipes(new JoiValidationPipe(RemoveFoodAddonCategorySchema))
	async removeFoodAddonItem(
		@Param("foodId") foodId: string,
		@Body() body: RemoveFoodAddonCategoryDto,
	) {
		return await this.adminService.removeFoodAddonCategory(
			foodId,
			body.addonCategoryIds,
		);
	}

	@Delete("foods/:foodId/addons/items")
	@ApiOperation({
		summary: "Remove an associated food addon items from a food item",
	})
	@UsePipes(new JoiValidationPipe(RemoveFoodAddonItemsSchema))
	async removeFoodAddonItems(
		@Param("foodId") foodId: string,
		@Body() body: RemoveFoodAddonItemsDto,
	) {
		return await this.adminService.removeFoodAddonItems(
			foodId,
			body.addonItemIds,
		);
	}

	@Get("foods/:foodId/addons")
	@ApiOperation({ summary: "Get all food addons associated with a food item" })
	async getFoodAddonsByFoodId(@Param("foodId") foodId: string) {
		return await this.adminService.getFoodAddonsByFoodId(foodId);
	}

	@Put("foods/:foodId/available")
	@ApiOperation({ summary: "Toggle food item available" })
	async toggleFoodAvailability(@Param("foodId") foodId: string) {
		return await this.adminService.makeFoodAvailable(foodId);
	}

	@Put("foods/:foodId/unavailable")
	@ApiOperation({ summary: "Toggle food item unavailable" })
	async toggleFoodUnavailability(@Param("foodId") foodId: string) {
		return await this.adminService.makeFoodUnavailable(foodId);
	}

	@Post("advert-banners")
	@ApiOperation({ summary: "Create an advert banner" })
	@ApiBody({ type: CreateAdvertBannerDto })
	@UsePipes(new JoiValidationPipe(CreateAdvertBannerSchema))
	async createAdvertBanner(@Body() body: CreateAdvertBannerDto) {
		return await this.adminService.createAdvertBanner({
			name: body.name,
			imageUrls: body.imageUrls,
			linkUrl: body.linkUrl,
		});
	}

	@Put("advert-banners/:id")
	@ApiOperation({ summary: "Update an advert banner" })
	@ApiBody({ type: UpdateAdvertBannerDto })
	@UsePipes(new JoiValidationPipe(UpdateAdvertBannerSchema))
	async updateAdvertBanner(
		@Param("id") bannerId: number,
		@Body() body: UpdateAdvertBannerDto,
	) {
		return await this.adminService.updateAdvertBanner(bannerId, {
			name: body.name,
			imageUrls: body.imageUrls,
			linkUrl: body.linkUrl,
		});
	}

	@Get("advert-banners")
	@ApiOperation({ summary: "Fetch advert banners" })
	async getAdvertBanner(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		query: PaginationQueryDto,
	) {
		return await this.adminService.getAdvertBanner(+query.page, +query.limit);
	}

	@Delete("advert-banners/:id")
	@ApiOperation({ summary: "Delete an advert banner" })
	async deleteAdvertBanner(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteAdvertBanner(+id);
	}

	@Put("advert-banners/:id/publish")
	@ApiOperation({ summary: "Publish an advert banner" })
	async publishAdvertBanner(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.publishAdvertBanner(id);
	}

	@Put("advert-banners/:id/unpublish")
	@ApiOperation({ summary: "Unpublish an advert banner" })
	async unpublishAdvertBanner(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.unpublishAdvertBanner(id);
	}

	@Post("vrgames/categories")
	@ApiOperation({ summary: "Create a new VR game category" })
	@ApiBody({ type: CreateVrGameCategoryDto })
	@UsePipes(new JoiValidationPipe(CreateVrGameCategorySchema))
	async createVRGameCategory(@Body() body: CreateVrGameCategoryDto) {
		return await this.adminService.createVRGameCategory(
			body.name,
			body.description,
		);
	}

	@Put("vrgames/categories/:id")
	@ApiOperation({ summary: "Update an existing VR game category" })
	@ApiBody({ type: UpdateVrGameCategoryDto })
	@UsePipes(new JoiValidationPipe(UpdateVrGameCategorySchema))
	async updateVRGameCategory(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: UpdateVrGameCategoryDto,
	) {
		return await this.adminService.updateVRGameCategory(
			id,
			body.name,
			body.description,
		);
	}

	@Delete("vrgames/categories/:id")
	@ApiOperation({ summary: "Delete a VR game category" })
	async deleteVRGameCategory(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteVRGameCategory(id);
	}

	@Get("vrgames/categories")
	@ApiOperation({ summary: "Get all VR game categories" })
	async getAllVRGameCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllVRGameCategories(+page, +limit);
	}

	@Get("vrgames/categories/:id")
	@ApiOperation({ summary: "Get a VR game category by ID" })
	async getVRGameCategoryById(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.getVRGameCategoryById(id);
	}

	@Post("vrgames")
	@ApiOperation({ summary: "Create a new VR game" })
	@ApiBody({ type: CreateVRGameDto })
	@UsePipes(new JoiValidationPipe(CreateVRGameSchema))
	async createVRGame(@Body() body: CreateVRGameDto) {
		return await this.adminService.createVRGame(body);
	}

	@Post("vrgames/availability")
	@ApiOperation({ summary: "Set vrgames availability" })
	@ApiBody({ type: CreateVrgameAvailabilityDto })
	@UsePipes(new JoiValidationPipe(CreateVrgameAvailabilitySchema))
	async createVrgameAvailability(@Body() body: CreateVrgameAvailabilityDto) {
		return await this.adminService.createVrgameAvailability(body);
	}

	@Delete("vrgames/:vrgameId/availability")
	@ApiOperation({ summary: "Delete a vrgame availability" })
	@UsePipes(new JoiValidationPipe(RemoveStudioAvailabilitySchema))
	async vrgamesStudioAvailability(
		@Param("vrgameId") vrgameId: string,
		@Body() body: RemoveVrgameAvailabilityDto,
	) {
		return await this.adminService.removeVrgameAvailability(
			vrgameId,
			body.availabilityIds,
		);
	}

	@Get("vrgames/:vrgameId/availability")
	@ApiOperation({ summary: "Get all availability for a specific studio" })
	async getVrgamesAvailabilityByStudioId(@Param("vrgameId") vrgameId: string) {
		return await this.adminService.getVrgamesAvailabilitiesByVrgameId(vrgameId);
	}

	@Put("vrgames/:id")
	@ApiOperation({ summary: "Update an existing VR game" })
	@ApiBody({ type: UpdateVRGameDto })
	@UsePipes(new JoiValidationPipe(UpdateVRGameSchema))
	async updateVRGame(@Param("id") id: string, @Body() body: UpdateVRGameDto) {
		return await this.adminService.updateVRGame(id, body);
	}

	@Delete("vrgames/:id")
	@ApiOperation({ summary: "Delete a VR game" })
	async deleteVRGame(@Param("id") id: string) {
		return await this.adminService.deleteVRGame(id);
	}

	@Get("vrgames")
	@ApiOperation({ summary: "Get all VR games with pagination" })
	async getAllVRGames(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllVRGames(+page, +limit);
	}

	@Get("vrgames/purchases")
	@ApiOperation({ summary: "Get all VR game purchases with pagination" })
	async getAllVRGamePurchases(
		@Query(new QueryJoiValidationPipe(TicketPaginationQuerySchema))
		{ page, limit, status }: TicketPaginationQueryDto,
	) {
		return await this.adminService.getVrgamesTicketPurchases({
			page,
			limit,
			status,
		});
	}

	@Get("vrgames/:id")
	@ApiOperation({ summary: "Get a VR game by ID" })
	async getVRGameById(@Param("id") id: string) {
		return await this.adminService.getVRGameById(id);
	}

	@Put("vrgames/:vrGameId/available")
	@ApiOperation({ summary: "Toggle VR game available" })
	async toggleVRGameAvailability(@Param("vrGameId") vrGameId: string) {
		return await this.adminService.makeVRGameAvailable(vrGameId);
	}

	@Put("vrgames/:vrGameId/unavailable")
	@ApiOperation({ summary: "Toggle VR game unavailable" })
	async toggleVRGameUnavailability(@Param("vrGameId") vrGameId: string) {
		return await this.adminService.makeVRGameUnavailable(vrGameId);
	}

	@Post("hotels/amenities")
	@ApiOperation({ summary: "Create new hotel amenities" })
	@ApiBody({ type: CreateHotelAmenitiesDto })
	@UsePipes(new JoiValidationPipe(CreateHotelAmenitiesSchema))
	async createHotelAmenities(@Body() body: CreateHotelAmenitiesDto) {
		return await this.adminService.createHotelAmenities(body.amenities);
	}

	@Put("hotels/amenities/:id")
	@ApiOperation({ summary: "Update an existing hotel amenity" })
	@ApiBody({ type: UpdateHotelAmenityDto })
	@UsePipes(new JoiValidationPipe(UpdateHotelAmenitySchema))
	async updateHotelAmenity(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: UpdateHotelAmenityDto,
	) {
		return await this.adminService.updateHotelAmenity(id, {
			name: body.name,
			icon: body.icon,
			iconPath: body.iconPath,
		});
	}

	@Delete("hotels/amenities/:id")
	@ApiOperation({ summary: "Delete a hotel amenity" })
	async deleteHotelAmenity(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteHotelAmenity(id);
	}

	@Get("hotels/amenities")
	@ApiOperation({ summary: "Get all hotel amenities" })
	async getAllHotelAmenities(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllHotelAmenities(+page, +limit);
	}

	@Post("hotels")
	@ApiOperation({ summary: "Create a new hotel" })
	@ApiBody({ type: CreateHotelDto })
	@UsePipes(new JoiValidationPipe(CreateHotelSchema))
	async createHotel(@Body() body: CreateHotelDto) {
		return await this.adminService.createHotel(body);
	}

	@Put("hotels/:id")
	@ApiOperation({ summary: "Update an existing hotel" })
	@ApiBody({ type: UpdateHotelDto })
	@UsePipes(new JoiValidationPipe(UpdateHotelSchema))
	async updateHotel(@Param("id") id: string, @Body() body: UpdateHotelDto) {
		return await this.adminService.updateHotel(id, body);
	}

	@Delete("hotels/:id")
	@ApiOperation({ summary: "Delete a hotel" })
	async deleteHotel(@Param("id") id: string) {
		return await this.adminService.deleteHotel(id);
	}

	@Post("hotels/:hotelId/rooms")
	@ApiOperation({ summary: "Create new hotel rooms" })
	@ApiBody({ type: CreateHotelRoomDto })
	@UsePipes(new JoiValidationPipe(CreateHotelRoomSchema))
	async createHotelRooms(
		@Param("hotelId") hotelId: string,
		@Body() body: CreateHotelRoomDto,
	) {
		return await this.adminService.createHotelRoom(hotelId, body);
	}

	@Put("hotels/:hotelId/rooms/:roomId")
	@ApiOperation({ summary: "Update an existing hotel room" })
	@ApiBody({ type: UpdateHotelRoomDto })
	@UsePipes(new JoiValidationPipe(UpdateHotelRoomSchema))
	async updateHotelRoom(
		@Param("hotelId") hotelId: string,
		@Param("roomId") roomId: string,
		@Body() body: UpdateHotelRoomDto,
	) {
		return await this.adminService.updateHotelRoom(hotelId, roomId, body);
	}

	@Delete("hotels/:hotelId/rooms/:roomId")
	@ApiOperation({ summary: "Delete a hotel room" })
	async deleteHotelRoom(
		@Param("hotelId") hotelId: string,
		@Param("roomId") roomId: string,
	) {
		return await this.adminService.deleteHotelRoom(hotelId, roomId);
	}

	@Post("hotels/:hotelId/amenities")
	@ApiOperation({ summary: "Associate amenities with a hotel" })
	@ApiBody({ type: AddHotelAmenitiesDto })
	@UsePipes(new JoiValidationPipe(AddHotelAmenitiesSchema))
	async addHotelAmenities(
		@Param("hotelId") hotelId: string,
		@Body() body: AddHotelAmenitiesDto,
	) {
		return await this.adminService.addHotelAmenities(hotelId, body.amenityIds);
	}

	@Delete("hotels/:hotelId/amenities")
	@ApiOperation({ summary: "Remove associated amenities from a hotel" })
	@UsePipes(new JoiValidationPipe(RemoveHotelAmenitiesSchema))
	async removeHotelAmenities(
		@Param("hotelId") hotelId: string,
		@Body() body: RemoveHotelAmenitiesDto,
	) {
		return await this.adminService.removeHotelAmenities(
			hotelId,
			body.amenityIds,
		);
	}

	@Get("hotels")
	@ApiOperation({ summary: "Get all hotels with pagination" })
	async getAllHotels(
		@Query(new QueryJoiValidationPipe(ServicePaginationQuerySchema))
		{ page, limit, search }: ServicePaginationQueryDto,
	) {
		return await this.adminService.getAllHotels(+page, +limit, search);
	}

	@Get("hotels/bookings")
	@ApiOperation({ summary: "Get all hotel bookings with pagination" })
	async getAllHotelBookings(
		@Query(new QueryJoiValidationPipe(BookingPaginationQuerySchema))
		{ page, limit, status }: BookingPaginationQueryDto,
	) {
		return await this.adminService.getHotelBookings({
			page,
			limit,
			status,
		});
	}

	@Get("hotels/:id")
	@ApiOperation({ summary: "Get a hotel by ID" })
	async getHotelById(@Param("id") id: string) {
		return await this.adminService.getHotelById(id);
	}

	@Put("hotels/:hotelId/rooms/:roomId/available")
	@ApiOperation({ summary: "Toggle hotel room available" })
	async toggleHotelRoomAvailability(
		@Param("hotelId") hotelId: string,
		@Param("roomId") roomId: string,
	) {
		return await this.adminService.makeHotelRoomAvailable(hotelId, roomId);
	}

	@Put("hotels/:hotelId/rooms/:roomId/unavailable")
	@ApiOperation({ summary: "Toggle hotel room unavailable" })
	async toggleHotelRoomUnavailability(
		@Param("hotelId") hotelId: string,
		@Param("roomId") roomId: string,
	) {
		return await this.adminService.makeHotelRoomUnavailable(hotelId, roomId);
	}

	@Put("hotels/:hotelId/available")
	@ApiOperation({ summary: "Toggle hotel available" })
	async toggleHotelAvailability(@Param("hotelId") hotelId: string) {
		return await this.adminService.makeHotelAvailable(hotelId);
	}

	@Put("hotels/:hotelId/unavailable")
	@ApiOperation({ summary: "Toggle hotel unavailable" })
	async toggleHotelUnavailability(@Param("hotelId") hotelId: string) {
		return await this.adminService.makeHotelUnavailable(hotelId);
	}

	@Post("equipments/categories")
	@ApiOperation({ summary: "Create new equipment categories" })
	@ApiBody({ type: CreateEquipmentCategoriesDto })
	@UsePipes(new JoiValidationPipe(CreateEquipmentCategoriesSchema))
	async createEquipmentCategories(@Body() body: CreateEquipmentCategoriesDto) {
		return await this.adminService.creaeteEquipmentRentalCategories(body);
	}

	@Put("equipments/categories/:id")
	@ApiOperation({ summary: "Update an existing equipment category" })
	@ApiBody({ type: UpdateEquipmentCategoryDto })
	@UsePipes(new JoiValidationPipe(UpdateEquipmentCategorySchema))
	async updateEquipmentCategory(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: UpdateEquipmentCategoryDto,
	) {
		return await this.adminService.updateEquipmentRentalCategory(id, body);
	}

	@Delete("equipments/categories/:id")
	@ApiOperation({ summary: "Delete an equipment category" })
	async deleteEquipmentCategory(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteEquipmentRentalCategory(id);
	}

	@Get("equipments/categories")
	@ApiOperation({ summary: "Get all equipment categories" })
	async getAllEquipmentCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllEquipmentRentalCategories(
			+page,
			+limit,
		);
	}

	@Post("equipments")
	@ApiOperation({ summary: "Create a new equipment rental item" })
	@ApiBody({ type: CreateEquipmentRentalDto })
	@UsePipes(new JoiValidationPipe(CreateEquipmentRentalSchema))
	async createEquipmentRental(@Body() body: CreateEquipmentRentalDto) {
		return await this.adminService.createEquipmentRental(body);
	}

	@Put("equipments/:id")
	@ApiOperation({ summary: "Update an existing equipment rental item" })
	@ApiBody({ type: UpdateEquipmentRentalDto })
	@UsePipes(new JoiValidationPipe(UpdateEquipmentRentalSchema))
	async updateEquipmentRental(
		@Param("id") id: string,
		@Body() body: UpdateEquipmentRentalDto,
	) {
		return await this.adminService.updateEquipmentRental(id, body);
	}

	@Delete("equipments/:id")
	@ApiOperation({ summary: "Delete an equipment rental item" })
	async deleteEquipmentRental(@Param("id") id: string) {
		return await this.adminService.deleteEquipmentRental(id);
	}

	@Get("equipments/bookings")
	@ApiOperation({
		summary: "Get all equipment rental bookings with pagination",
	})
	async getAllEquipmentRentalBookings(
		@Query(new QueryJoiValidationPipe(EquipmentPaginationQuerySchema))
		{ page, limit, status }: EquipmentPaginationQueryDto,
	) {
		return await this.adminService.getEquipmentRentalBookings({
			page,
			limit,
			status,
		});
	}

	@Get("equipments/:id")
	@ApiOperation({ summary: "Get an equipment rental item by ID" })
	async getEquipmentRentalById(@Param("id") id: string) {
		return await this.adminService.getEquipmentRentalById(id);
	}

	@Get("equipments")
	@ApiOperation({ summary: "Get all equipment rental items with pagination" })
	async getAllEquipmentRentals(
		@Query(new QueryJoiValidationPipe(ServicePaginationQuerySchema))
		{ page, limit, categoryId }: ServicePaginationQueryDto,
	) {
		return await this.adminService.getAllEquipmentRentals({
			page,
			limit,
			categoryId,
		});
	}

	@Put("equipments/:equipmentId/available")
	@ApiOperation({ summary: "Toggle equipment rental item available" })
	async toggleEquipmentRentalAvailability(
		@Param("equipmentId") equipmentId: string,
	) {
		return await this.adminService.makeEquipmentRentalAvailable(equipmentId);
	}

	@Put("equipments/:equipmentId/unavailable")
	@ApiOperation({ summary: "Toggle equipment rental item unavailable" })
	async toggleEquipmentRentalUnavailability(
		@Param("equipmentId") equipmentId: string,
	) {
		return await this.adminService.makeEquipmentRentalUnavailable(equipmentId);
	}

	@Post("movies/genres")
	@ApiOperation({ summary: "Create new movie genres" })
	@ApiBody({ type: CreateMovieGenresDto })
	@UsePipes(new JoiValidationPipe(CreateMovieGenresSchema))
	async createMovieGenres(@Body() body: CreateMovieGenresDto) {
		return await this.adminService.createMovieGenres(body);
	}

	@Put("movies/genres/:id")
	@ApiOperation({ summary: "Update an existing movie genre" })
	@ApiBody({ type: UpdateMovieGenreDto })
	@UsePipes(new JoiValidationPipe(UpdateMovieGenreSchema))
	async updateMovieGenre(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: UpdateMovieGenreDto,
	) {
		return await this.adminService.updateMovieGenre(id, body);
	}

	@Delete("movies/genres/:id")
	@ApiOperation({ summary: "Delete a movie genre" })
	async deleteMovieGenre(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteMovieGenre(id);
	}

	@Get("movies/genres")
	@ApiOperation({ summary: "Get all movie genres" })
	async getAllMovieGenres(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllMovieGenres(+page, +limit);
	}

	@Post("movies/snacks")
	@ApiOperation({ summary: "Create a new movie snack combo" })
	@ApiBody({ type: CreateSnacksDto })
	@UsePipes(new JoiValidationPipe(CreateSnacksSchema))
	async createSnacks(@Body() body: CreateSnacksDto) {
		return await this.adminService.createSnacks(body);
	}

	@Put("movies/snacks/:id")
	@ApiOperation({ summary: "Update an existing movie snack combo" })
	@ApiBody({ type: UpdateSnacksDto })
	@UsePipes(new JoiValidationPipe(UpdateSnacksSchema))
	async updateSnacks(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: UpdateSnacksDto,
	) {
		return await this.adminService.updateSnacks(id, body);
	}

	@Delete("movies/snacks/:id")
	@ApiOperation({ summary: "Delete a movie snack combo" })
	async deleteSnacks(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteSnacks(id);
	}

	@Get("movies/snacks")
	@ApiOperation({ summary: "Get all movie snack combos with pagination" })
	async getAllSnacks(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllSnacks(+page, +limit);
	}

	@Post("movies/:movieId/snacks")
	@ApiOperation({ summary: "Associate snack combos with a movie" })
	@ApiBody({ type: MovieSnacksIdsDto })
	@UsePipes(new JoiValidationPipe(MovieSnacksIdsSchema))
	async addSnacksToMovie(
		@Param("movieId") movieId: string,
		@Body() body: MovieSnacksIdsDto,
	) {
		return await this.adminService.addSnacksToMovie(movieId, body.snackIds);
	}

	@Delete("movies/:movieId/snacks")
	@ApiOperation({ summary: "Remove associated snack combos from a movie" })
	@UsePipes(new JoiValidationPipe(MovieSnacksIdsSchema))
	async removeSnacksFromMovie(
		@Param("movieId") movieId: string,
		@Body() body: MovieSnacksIdsDto,
	) {
		return await this.adminService.removeSnacksFromMovie(
			movieId,
			body.snackIds,
		);
	}

	@Get("movies/:movieId/snacks")
	@ApiOperation({ summary: "Get all snack combos associated with a movie" })
	async getSnacksByMovieId(@Param("movieId") movieId: string) {
		return await this.adminService.getSnacksByMovieId(movieId);
	}

	@Get("movies/purchases")
	@ApiOperation({ summary: "Get all movie bookings with pagination" })
	async getAllMovieBookings(
		@Query(new QueryJoiValidationPipe(TicketPaginationQuerySchema))
		{ page, limit, status }: TicketPaginationQueryDto,
	) {
		return await this.adminService.getMovieTicketPurchases({
			page,
			limit,
			status,
		});
	}

	@Post("cinemas")
	@ApiOperation({ summary: "Create a new cinema" })
	@ApiBody({ type: CreateCinemaDto })
	@UsePipes(new JoiValidationPipe(CreateCinemaSchema))
	async createCinema(@Body() body: CreateCinemaDto) {
		return await this.adminService.createCinema(body);
	}

	@Put("cinemas/:id")
	@ApiOperation({ summary: "Update an existing cinema" })
	@ApiBody({ type: UpdateCinemaDto })
	@UsePipes(new JoiValidationPipe(UpdateCinemaSchema))
	async updateCinema(@Param("id") id: string, @Body() body: UpdateCinemaDto) {
		return await this.adminService.updateCinema(id, body);
	}

	@Delete("cinemas/:id")
	@ApiOperation({ summary: "Delete a cinema" })
	async deleteCinema(@Param("id") id: string) {
		return await this.adminService.deleteCinema(id);
	}

	@Get("cinemas/halls")
	@ApiOperation({ summary: "Get all cinema halls with pagination" })
	async getAllCinemaHallsGeneral(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllCinemaHalls(+page, +limit);
	}

	@Get("cinemas/:id")
	@ApiOperation({ summary: "Get a cinema by ID" })
	async getCinemaById(@Param("id") id: string) {
		return await this.adminService.getCinemaById(id);
	}

	@Get("cinemas")
	@ApiOperation({ summary: "Get all cinemas with pagination" })
	async getAllCinemas(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllCinemas(+page, +limit);
	}

	@Post("cinemas/halls")
	@ApiOperation({ summary: "Add halls to a cinema" })
	@ApiBody({ type: CreateCinemaHallDto })
	@UsePipes(new JoiValidationPipe(CreateCinemaHallSchema))
	async addCinemaHalls(@Body() body: CreateCinemaHallDto) {
		return await this.adminService.createCinemaHall(body);
	}

	@Put("cinemas/:cinemaId/halls/:hallId")
	@ApiOperation({ summary: "Update a cinema hall" })
	@ApiBody({ type: UpdateCinemaHallDto })
	@UsePipes(new JoiValidationPipe(UpdateCinemaHallSchema))
	async updateCinemaHall(
		@Param("cinemaId") cinemaId: string,
		@Param("hallId") hallId: string,
		@Body() body: UpdateCinemaHallDto,
	) {
		return await this.adminService.updateCinemaHall(cinemaId, hallId, body);
	}

	@Delete("cinemas/:cinemaId/halls/:hallId")
	@ApiOperation({ summary: "Delete a cinema hall" })
	async deleteCinemaHall(
		@Param("cinemaId") cinemaId: string,
		@Param("hallId") hallId: string,
	) {
		return await this.adminService.deleteCinemaHall(cinemaId, hallId);
	}

	@Get("cinemas/halls/:hallId")
	@ApiOperation({ summary: "Get a cinema hall by ID" })
	async getCinemaHallById(@Param("hallId") hallId: string) {
		return await this.adminService.getCinemaHallById(hallId);
	}

	@Get("cinemas/:cinemaId/halls")
	@ApiOperation({ summary: "Get all halls in a cinema with pagination" })
	async getAllCinemaHalls(
		@Param("cinemaId") cinemaId: string,
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllCinemaHallsByCinemaId(
			cinemaId,
			+page,
			+limit,
		);
	}

	@Post("movies")
	@ApiOperation({ summary: "Create a new movie cinema" })
	@ApiBody({ type: CreateCinemaMovieDto })
	@UsePipes(new JoiValidationPipe(CreateCinemaMovieSchema))
	async createCinemaMovie(@Body() body: CreateCinemaMovieDto) {
		return await this.adminService.createCinemaMovie(body);
	}

	@Put("movies/:id")
	@ApiOperation({ summary: "Update an existing movie cinema" })
	@ApiBody({ type: UpdateCinemaMovieDto })
	@UsePipes(new JoiValidationPipe(UpdateCinemaMovieSchema))
	async updateCinemaMovie(
		@Param("id") id: string,
		@Body() body: UpdateCinemaMovieDto,
	) {
		return await this.adminService.updateCinemaMovie(id, body);
	}

	@Delete("movies/:id")
	@ApiOperation({ summary: "Delete a movie cinema" })
	async deleteCinemaMovie(@Param("id") id: string) {
		return await this.adminService.deleteCinemaMovie(id);
	}

	@Get("movies/showtimes")
	@ApiOperation({ summary: "Get all movies by showtime" })
	async getTodayMovieShowtimes(
		@Query(new QueryJoiValidationPipe(MovieShowtimePaginationQuerySchema))
		{ page, limit, date }: MovieShowtimePaginationQueryDto,
	) {
		return await this.adminService.getMoviesByShowtime(date, +page, +limit);
	}

	@Get("movies/:id")
	@ApiOperation({ summary: "Get a movie cinema by ID" })
	async getCinemaMovieById(@Param("id") id: string) {
		return await this.adminService.getCinemaMovieById(id);
	}

	@Get("movies")
	@ApiOperation({ summary: "Get all movie cinemas with pagination" })
	async getAllCinemaMovies(
		@Query(new QueryJoiValidationPipe(MoviePaginationQuerySchema))
		{ page, limit, genreId }: MoviePaginationQueryDto,
	) {
		return await this.adminService.getAllCinemaMovies({
			page,
			limit,
			genreId,
		});
	}

	@Post("movies/:movieId/genres")
	@ApiOperation({ summary: "Associate genres with a movie" })
	@ApiBody({ type: AddMovieGenresToMovieDto })
	@UsePipes(new JoiValidationPipe(AddMovieGenresToMovieSchema))
	async addGenresToMovie(
		@Param("movieId") movieId: string,
		@Body() body: AddMovieGenresToMovieDto,
	) {
		return await this.adminService.addMovieGenresToCinemaMovie(
			movieId,
			body.genreIds,
		);
	}

	@Delete("movies/:movieId/genres")
	@ApiOperation({ summary: "Remove associated genres from a movie" })
	@UsePipes(new JoiValidationPipe(RemoveMovieGenresFromMovieSchema))
	async removeGenresFromMovie(
		@Param("movieId") movieId: string,
		@Body() body: RemoveMovieGenresFromMovieDto,
	) {
		return await this.adminService.removeMovieGenresFromCinemaMovie(
			movieId,
			body.genreIds,
		);
	}

	@Post("movies/showtimes")
	@ApiOperation({ summary: "Add showtimes to a movie" })
	@ApiBody({ type: CreateMovieShowtimeDto })
	@UsePipes(new JoiValidationPipe(CreateMovieShowtimeSchema))
	async addShowtimesToMovie(@Body() body: CreateMovieShowtimeDto) {
		return await this.adminService.createMovieShowtime(body);
	}

	@Put("movies/showtimes/:id")
	@ApiOperation({ summary: "Update a movie showtime" })
	@ApiBody({ type: UpdateMovieShowtimeDto })
	@UsePipes(new JoiValidationPipe(UpdateMovieShowtimeSchema))
	async updateMovieShowtime(
		@Param("id") id: number,
		@Body() body: UpdateMovieShowtimeDto,
	) {
		return await this.adminService.updateMovieShowtime(id, body);
	}

	@Delete("movies/showtimes/:id")
	@ApiOperation({ summary: "Delete a movie showtime" })
	async deleteMovieShowtime(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteMovieShowtime(id);
	}

	@Put("movies/showtimes/:id/available")
	@ApiOperation({ summary: "Toggle movie showtime available" })
	async toggleMovieShowtimeAvailability(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.makeMovieShowtimeAvailable(id);
	}

	@Put("movies/showtimes/:id/unavailable")
	@ApiOperation({ summary: "Toggle movie showtime unavailable" })
	async toggleMovieShowtimeUnavailability(
		@Param("id", ParseIntPipe) id: number,
	) {
		return await this.adminService.makeMovieShowtimeUnavailable(id);
	}

	@Get("movies/:movieId/showtimes")
	@ApiOperation({ summary: "Get all showtimes for a specific movie" })
	async getShowtimesByMovieId(
		@Param("movieId") movieId: string,
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getMovieShowtimeByMovieId(
			movieId,
			+page,
			+limit,
		);
	}

	@Get("movies/showtimes/upcoming")
	@ApiOperation({ summary: "Get all upcoming movie showtimes" })
	async getUpcomingMovieShowtimes(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getUpcomingMovies(+page, +limit);
	}

	@Post("studios")
	@ApiOperation({ summary: "Create a new studio" })
	@ApiBody({ type: CreateStudioDto })
	@UsePipes(new JoiValidationPipe(CreateStudioSchema))
	async createStudio(@Body() body: CreateStudioDto) {
		return await this.adminService.createStudio(body);
	}

	@Put("studios/:id")
	@ApiOperation({ summary: "Update an existing studio" })
	@ApiBody({ type: UpdateStudioDto })
	@UsePipes(new JoiValidationPipe(UpdateStudioSchema))
	async updateStudio(@Param("id") id: number, @Body() body: UpdateStudioDto) {
		return await this.adminService.updateStudio(id, body);
	}

	@Delete("studios/:id")
	@ApiOperation({ summary: "Delete a studio" })
	async deleteStudio(@Param("id", ParseIntPipe) id: number) {
		return await this.adminService.deleteStudio(id);
	}

	@Put("studios/:studioId/available")
	@ApiOperation({ summary: "Toggle studio available" })
	async toggleStudioAvailability(
		@Param("studioId", ParseIntPipe) studioId: number,
	) {
		return await this.adminService.makeStudioAvailable(studioId);
	}

	@Put("studios/:studioId/unavailable")
	@ApiOperation({ summary: "Toggle studio unavailable" })
	async toggleStudioUnavailability(
		@Param("studioId", ParseIntPipe) studioId: number,
	) {
		return await this.adminService.makeStudioUnavailable(studioId);
	}

	@Get("studios")
	@ApiOperation({ summary: "Get all studios with pagination" })
	async getAllStudios(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllStudios(+page, +limit);
	}

	@Post("studios/availability")
	@ApiOperation({ summary: "Set studio availability" })
	@ApiBody({ type: CreateStudioAvailabilityDto })
	@UsePipes(new JoiValidationPipe(CreateStudioAvailabilitySchema))
	async createStudioAvailability(@Body() body: CreateStudioAvailabilityDto) {
		return await this.adminService.createStudioAvailability(body);
	}

	@Delete("studios/:studioId/availability")
	@ApiOperation({ summary: "Delete a studio availability" })
	@UsePipes(new JoiValidationPipe(RemoveStudioAvailabilitySchema))
	async removeStudioAvailability(
		@Param("studioId", ParseIntPipe) studioId: number,
		@Body() body: RemoveStudioAvailabilityDto,
	) {
		return await this.adminService.removeStudioAvailability(
			studioId,
			body.availabilityIds,
		);
	}

	@Get("studios/:studioId/availability")
	@ApiOperation({ summary: "Get all availability for a specific studio" })
	async getStudioAvailabilityByStudioId(
		@Param("studioId", ParseIntPipe) studioId: number,
	) {
		return await this.adminService.getStudioAvailabilitiesByStudioId(studioId);
	}

	@Get("studios/bookings")
	@ApiOperation({ summary: "Get all studio bookings with pagination" })
	async getAllStudioBookings(
		@Query(new QueryJoiValidationPipe(StudioSessionPaginationQuerySchema))
		{ page, limit, status, search }: StudioSessionPaginationQueryDto,
	) {
		return await this.adminService.getStudioBookings({
			page,
			limit,
			status,
			search,
		});
	}

	@Get("users")
	@ApiOperation({ summary: "Get all users with pagination" })
	async getAllUsers(
		@Query(new QueryJoiValidationPipe(UserPaginationQuerySchema))
		{ page, limit, search }: UserPaginationQueryDto,
	) {
		return await this.adminService.getAllUsers(+page, +limit, search);
	}

	@Get("dashboard/stats")
	@ApiOperation({ summary: "Get dashboard stats" })
	async getDashboardStats() {
		return await this.adminService.getDashboardStats();
	}

	@Post("delivery-settings")
	@ApiOperation({ summary: "Create delivery settings" })
	@ApiBody({ type: CreateDeliverySettingsDto })
	@UsePipes(new JoiValidationPipe(DeliverySettingsSchema))
	async upsertDeliverySettings(@Body() body: CreateDeliverySettingsDto) {
		return await this.adminService.createAdminDeliverySetting(body);
	}

	@Patch("delivery-settings/:id")
	@ApiOperation({ summary: "Update delivery settings" })
	@ApiBody({ type: UpdateDeliverySettingsDto })
	@UsePipes(new JoiValidationPipe(UpdateDeliverySettingsSchema))
	async updateDeliverySettings(
		@Param("id", ParseIntPipe) id: number,
		@Body() body: UpdateDeliverySettingsDto,
	) {
		return await this.adminService.updateAdminDeliverySetting(id, body);
	}

	@Get("delivery-settings")
	@ApiOperation({ summary: "Get delivery settings" })
	async getDeliverySettings() {
		return await this.adminService.getAdminDeliverySetting();
	}

	@Patch("orders/foods/:foodOrderId/status")
	@ApiOperation({ summary: "Update food order status" })
	@ApiBody({ type: UpdateFoodOrderStatusDto })
	@UsePipes(new JoiValidationPipe(UpdateFoodOrderStatusSchema))
	async updateFoodOrderStatus(
		@Param("foodOrderId") orderId: string,
		@Body() body: UpdateFoodOrderStatusDto,
	) {
		return await this.adminService.updateFoodOrderStatus(orderId, body.status);
	}

	@Patch("orders/equipments/:equipmentOrderId/status")
	@ApiOperation({ summary: "Update equipment order status" })
	@ApiBody({ type: UpdateEquipmentOrderStatusDto })
	@UsePipes(new JoiValidationPipe(UpdateEquipmentOrderStatusSchema))
	async updateEquipmentOrderStatus(
		@Param("equipmentOrderId") orderId: string,
		@Body() body: UpdateEquipmentOrderStatusDto,
	) {
		return await this.adminService.updateEquipmentRentalBookingStatus(
			orderId,
			body.status,
		);
	}

	@Get("orders")
	@ApiOperation({ summary: "Get all orders with pagination" })
	async getAllOrders(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getAllOrders(page, limit);
	}

	@Get("notifications/read")
	@ApiOperation({ summary: "Get all notifications with pagination" })
	async getAllNotifications(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getReadAdminNotifications(page, limit);
	}

	@Get("notifications/unread")
	@ApiOperation({ summary: "Get all unread notifications with pagination" })
	async getAllUnreadNotifications(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.adminService.getUnreadAdminNotifications(page, limit);
	}

	@Put("notifications/:notificationId/read")
	@ApiOperation({ summary: "Mark a notification as read" })
	async markNotificationAsRead(
		@Param("notificationId", ParseIntPipe) notificationId: number,
	) {
		return await this.adminService.markNotificationAsRead(notificationId);
	}

	@Get("services-subscriptions/monthly-stats")
	@ApiOperation({ summary: "Get services monthly subscription stats" })
	async servicesSubscriptionMonthlyStats(
		@Query(new QueryJoiValidationPipe(YearQuerySchema)) query: YearQueryDto,
	) {
		return await this.adminService.servicesSubscriptionMonthlyStats(query.year);
	}

	@Get("revenue/monthly-stats")
	@ApiOperation({ summary: "Get monthly revenue stats" })
	async getMonthlyRevenueStats(
		@Query(new QueryJoiValidationPipe(YearQuerySchema)) query: YearQueryDto,
	) {
		return await this.adminService.getMonthlyRevenueStats(query.year);
	}
}
