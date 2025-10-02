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
} from "src/common/dto/requestQuery.dto";
import { AuthGuard } from "src/common/guards/auth.guard";
import { QueryJoiValidationPipe } from "src/common/pipes/query-validation.pipe";
import { JoiValidationPipe } from "src/common/pipes/validation.pipe";
import { AdminService } from "./admin.service";
import {
	CreateFoodAddonCategories,
	CreateFoodAddonCategoriesSchema,
	CreateFoodAddonItemsDto,
	CreateFoodAddonItemsSchema,
	CreateFoodCategoryDto,
	CreateFoodCategorySchema,
	UpdateFoodAddonCategoryDto,
	UpdateFoodAddonCategorySchema,
	UpdateFoodAddonItemDto,
	UpdateFoodAddonItemSchema,
	UpdateFoodCategoryDto,
} from "./dto/category.dto";
import {
	AddFoodAddonItemsSchema,
	AddFoodAddonsDto,
	CreateAdvertBannerDto,
	CreateAdvertBannerSchema,
	CreateFoodDto,
	CreateFoodSchema,
	RemoveFoodAddonCategoryDto,
	RemoveFoodAddonCategorySchema,
	RemoveFoodAddonItemsDto,
	RemoveFoodAddonItemsSchema,
	UpdateAdvertBannerDto,
	UpdateAdvertBannerSchema,
	UpdateFoodDto,
	UpdateFoodSchema,
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
}
