import { Controller, Get, Param, Query } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { QueryJoiValidationPipe } from "src/common/pipes/query-validation.pipe";
import {
	PaginationQueryDto,
	PaginationQuerySchema,
	ServicePaginationQueryDto,
	ServicePaginationQuerySchema,
} from "src/common/dto/requestQuery.dto";
import { ApiOperation } from "@nestjs/swagger";

@Controller({ version: "1" })
export class ServicesController {
	constructor(private readonly servicesService: ServicesService) {}

	@Get("foods/categories")
	@ApiOperation({ summary: "Get food categories with pagination" })
	async getFoodCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.servicesService.getFoodCategories(page, limit);
	}

	@Get("foods/:id")
	@ApiOperation({ summary: "Get a food item by ID" })
	async getFoodById(@Param("id") id: string) {
		return await this.servicesService.getFoodById(id);
	}

	@Get("foods")
	@ApiOperation({
		summary: "Get all food items with pagination, filtering, and search",
	})
	async getAllFoods(
		@Query(new QueryJoiValidationPipe(ServicePaginationQuerySchema))
		{ page, limit, categoryId, search }: ServicePaginationQueryDto,
	) {
		return await this.servicesService.getAllFoods({
			page,
			limit,
			categoryId,
			search,
		});
	}

	@Get("advert-banners")
	@ApiOperation({ summary: "Get all advertisement banners" })
	async getAdvertBanners(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema)) {
			page,
			limit,
		}: PaginationQueryDto,
	) {
		return await this.servicesService.getAllAdvertBanners(page, limit);
	}

	@Get("vrgames")
	@ApiOperation({ summary: "Get all VR games with pagination" })
	async getAllVrGames(
		@Query(new QueryJoiValidationPipe(ServicePaginationQuerySchema))
		{ page, limit, categoryId, search }: ServicePaginationQueryDto,
	) {
		return await this.servicesService.getVrGames({
			page,
			limit,
			categoryId,
			search,
		});
	}

	@Get("vrgames/categories")
	@ApiOperation({ summary: "Get VR game categories with pagination" })
	async getVrGameCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.servicesService.getAllVrGameCategories(page, limit);
	}

	@Get("vrgames/:id")
	@ApiOperation({ summary: "Get a VR game by ID" })
	async getVrGameById(@Param("id") id: string) {
		return await this.servicesService.getVrGameById(id);
	}
}
