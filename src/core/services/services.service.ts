import { Injectable, NotFoundException } from "@nestjs/common";
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

	async getAllVrGameCategories(page = 1, limit = 10) {
		const offset = (Number(page) - 1) * Number(limit);

		const categories = await this.servicesRepository.getAllVrGameCategories(
			offset,
			limit,
		);

		return {
			categories,
			pagination: {
				page,
				limit,
				nextPage: categories.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getVrGames({
		page,
		limit,
		categoryId,
		search,
	}: { page: number; limit: number; categoryId?: number; search?: string }) {
		const offset = (Number(page) - 1) * Number(limit);

		const vrgames = await this.servicesRepository.getVrGames({
			offset,
			limit,
			categoryId,
			search,
		});

		return {
			vrgames,
			pagination: {
				page,
				limit,
				nextPage: vrgames.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getVrGameById(id: string) {
		const vrgames = await this.servicesRepository.getVrGameById(id);

		if (vrgames.length === 0) {
			throw new NotFoundException("VR game not found");
		}

		return vrgames;
	}

	async getAllHotelAmenities(page = 1, limit = 10) {
		const offset = (Number(page) - 1) * Number(limit);

		const amenities = await this.servicesRepository.getAllHotelAmenities(
			offset,
			limit,
		);

		return {
			amenities,
			pagination: {
				page,
				limit,
				nextPage: amenities.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getHotelById(id: string) {
		const hotel = await this.servicesRepository.getHotelById(id);

		if (!hotel) {
			throw new NotFoundException("Hotel not found");
		}

		return hotel;
	}

	async getAllHotels({
		page,
		limit,
		search,
		coordinates,
		radius,
	}: {
		page: number;
		limit: number;
		search?: string;
		coordinates?: { lat?: number; lon?: number };
		radius?: number;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		const hotels = await this.servicesRepository.getHotels({
			offset,
			limit,
			search,
			coordinates,
			radiusInKm: radius,
		});

		return {
			hotels,
			pagination: {
				page,
				limit,
				nextPage: hotels.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getEquipmentCategories(page = 1, limit = 10) {
		const offset = (Number(page) - 1) * Number(limit);

		const categories = await this.servicesRepository.getEquipmentCategories(
			offset,
			limit,
		);

		return {
			categories,
			pagination: {
				page,
				limit,
				nextPage: categories.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getAllEquipmentRentals({
		page,
		limit,
		categoryId,
		search,
	}: { page: number; limit: number; categoryId?: number; search?: string }) {
		const offset = (Number(page) - 1) * Number(limit);

		const rentals = await this.servicesRepository.getAllEquipmentRentals({
			offset,
			limit,
			categoryId,
			search,
		});

		return {
			rentals,
			pagination: {
				page,
				limit,
				nextPage: rentals.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getEquipmentRentalById(id: string) {
		const rental = await this.servicesRepository.getEquipmentRentalById(id);

		if (!rental) {
			throw new NotFoundException("Equipment rental not found");
		}

		return rental;
	}
}
