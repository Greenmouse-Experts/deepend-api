import { Injectable } from "@nestjs/common";
import { ServicesRepository } from "./service.repository";

@Injectable()
export class ServicesService {
	constructor(private readonly servicesRepository: ServicesRepository) {}

	async getFoodCategories(page: number, limit: number) {
		const offset = (page - 1) * limit;
		return await this.servicesRepository.getFoodCategories(offset, limit);
	}

	async getFoodById(id: string) {
		return await this.servicesRepository.getFoodById(id);
	}

	async getAllFoods({
		page,
		limit,
		categoryId,
		search,
	}: {
		page: number;
		limit: number;
		categoryId?: number;
		search?: string;
	}) {
		const offset = (Number(page) - 1) * (Number(limit) + 1);

		const foods = await this.servicesRepository.getAllFoods({
			offset,
			limit,
			categoryId,
			search,
		});

		if (foods.length > limit) {
			foods.pop();
			return {
				foods,
				pagination: {
					page,
					limit,
					nextPage: Number(page) + 1,
					prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
				},
			};
		}

		return {
			foods,
			pagination: {
				page,
				limit,
				nextPage: null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getAllAdvertBanners(page = 1, limit = 10) {
		const offset = (Number(page) - 1) * Number(limit);

		const banners = await this.servicesRepository.getAllAdvertBanners(
			offset,
			limit,
		);

		return {
			banners,
			pagination: {
				page,
				limit,
				nextPage: banners.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}
}
