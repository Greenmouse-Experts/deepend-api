import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
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
	PaginationQueryDto,
	PaginationQuerySchema,
	ServicePaginationQueryDto,
	ServicePaginationQuerySchema,
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
	CreateVrGameCategoryDto,
	CreateVrGameCategorySchema,
	UpdateEquipmentCategoryDto,
	UpdateEquipmentCategorySchema,
	UpdateFoodAddonCategoryDto,
	UpdateFoodAddonCategorySchema,
	UpdateFoodAddonItemDto,
	UpdateFoodAddonItemSchema,
	UpdateFoodCategoryDto,
	UpdateVrGameCategoryDto,
	UpdateVrGameCategorySchema,
} from "./dto/category.dto";
import {
	AddFoodAddonItemsSchema,
	AddFoodAddonsDto,
	AddHotelAmenitiesDto,
	AddHotelAmenitiesSchema,
	CreateAdvertBannerDto,
	CreateAdvertBannerSchema,
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
	CreateVRGameDto,
	CreateVRGameSchema,
	RemoveFoodAddonCategoryDto,
	RemoveFoodAddonCategorySchema,
	RemoveFoodAddonItemsDto,
	RemoveFoodAddonItemsSchema,
	RemoveHotelAmenitiesDto,
	RemoveHotelAmenitiesSchema,
	UpdateAdvertBannerDto,
	UpdateAdvertBannerSchema,
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
	UpdateVRGameDto,
	UpdateVRGameSchema,
} from "./dto/service.dto";

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
}
