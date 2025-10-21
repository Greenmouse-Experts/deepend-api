import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ServicesRepository } from "./service.repository";
import {
	BookEquipmentRentalDto,
	BookStudioSessionDto,
	CreateVrGameTicketOrderDto,
} from "../admin/dto/service.dto";
import {
	calculateEquipmentTotalPrice,
	calculateStudioTotalPrice,
	doIntervalsOverlap,
	getDayFromDate,
	isBookingWithinStudioHours,
} from "src/common/helpers";
import { isDatabaseError, mysqlErrorCodes } from "src/common/mysql.error";
import { isWithinInterval } from "date-fns";

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

		if (vrgames === null || vrgames === undefined) {
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

	async getUpcomingMovies({
		page = 1,
		limit = 10,
		search,
		genreId,
	}: { page: number; limit: number; search?: string; genreId?: number }) {
		const offset = (Number(page) - 1) * Number(limit);

		const movies = await this.servicesRepository.getUpcomingMovies({
			offset,
			limit,
			search,
			genreId,
		});

		return {
			movies,
			pagination: {
				page,
				limit,
				nextPage: movies.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getMoviesByShowtime({
		currentDate,
		page = 1,
		limit = 10,
		search,
		genreId,
	}: {
		currentDate: string;
		page: number;
		limit: number;
		search?: string;
		genreId?: number;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		const movies = await this.servicesRepository.getMoviesByShowtime({
			currentDate,
			offset,
			limit,
			search,
			genreId,
		});

		return {
			movies,
			pagination: {
				page,
				limit,
				nextPage: movies.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getAllStudios({
		search,
		page = 1,
		limit = 10,
	}: { search?: string; page: number; limit: number }) {
		const offset = (Number(page) - 1) * Number(limit);

		const studios = await this.servicesRepository.getAllStudios({
			search,
			offset,
			limit,
		});

		return {
			studios,
			pagination: {
				page,
				limit,
				nextPage: studios.length === Number(limit) ? Number(page) + 1 : null,
				prevPage: Number(page) - 1 > 0 ? Number(page) - 1 : null,
			},
		};
	}

	async getStudioTotalPrice(
		studioId: number,
		startTime: string,
		endTime: string,
	) {
		const studio = await this.servicesRepository.getStudioById(studioId);

		if (!studio) {
			throw new NotFoundException("Studio not found");
		}

		const studioTotalPrice = calculateStudioTotalPrice(
			Number(studio.hourlyRate),
			startTime,
			endTime,
		);

		return { totalPrice: studioTotalPrice };
	}

	async getStudioAvailabilityByStudioId(studioId: number) {
		const availability =
			await this.servicesRepository.getStudioAvailabilityByStudioId(studioId);

		return availability;
	}

	async getBookedStudioSessionsByDate(studioId: number, bookingDate: string) {
		const bookings =
			await this.servicesRepository.getBookedStudioSessionsByDate(
				studioId,
				bookingDate,
			);

		return bookings;
	}

	async getBookedStudioSessionsByDateRange(
		studioId: number,
		startDate: string,
		endDate: string,
	) {
		const bookings =
			await this.servicesRepository.getBookedStudioSessionsByDateRange(
				studioId,
				startDate,
				endDate,
			);

		return bookings;
	}

	async bookStudioSession(userId: string, bookingData: BookStudioSessionDto) {
		try {
			const studio = await this.servicesRepository.getStudioById(
				bookingData.studioId,
			);

			if (!studio) {
				throw new NotFoundException("Studio not found");
			}

			const bookingDayOfWeek = getDayFromDate(bookingData.bookingDate);

			const studioAvailability =
				await this.servicesRepository.getStudioAvailabilityByIdAndDayofWeek(
					bookingData.studioId,
					bookingDayOfWeek,
				);

			if (!studioAvailability) {
				throw new NotFoundException(
					"Studio is not available on the selected day",
				);
			}

			const studioTotalPrice = calculateStudioTotalPrice(
				Number(studio.hourlyRate),
				bookingData.startTime,
				bookingData.endTime,
			);

			if (
				!isBookingWithinStudioHours(
					bookingData.startTime,
					bookingData.endTime,
					studioAvailability.startTime,
					studioAvailability.endTime,
				)
			) {
				throw new NotFoundException(
					"Studio is not available at the selected time",
				);
			}

			const existingBookings =
				await this.servicesRepository.getBookedStudioSessionsByDate(
					bookingData.studioId,
					bookingData.bookingDate,
				);

			if (existingBookings.length > 0) {
				for (const booking of existingBookings) {
					if (
						doIntervalsOverlap(
							booking.startTime,
							booking.endTime,
							bookingData.startTime,
							bookingData.endTime,
						)
					) {
						throw new NotFoundException(
							"Studio is already booked at the selected time",
						);
					}
				}
			}

			return await this.servicesRepository.bookStudioSession({
				...bookingData,
				totalPrice: String(studioTotalPrice),
				userId,
			});
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			)
				throw new BadRequestException(
					"You have a pending booking for this studio. Please complete or cancel it before making a new booking.",
				);

			throw error;
		}
	}

	async bookEquipmentRental(
		userId: string,
		bookingData: BookEquipmentRentalDto,
	) {
		try {
			const equipment = await this.servicesRepository.getEquipmentRentalById(
				bookingData.equipmentRentalId,
			);

			if (!equipment) {
				throw new NotFoundException("Equipment rental not found");
			}

			const equipmentRentalTotalPrice = calculateEquipmentTotalPrice(
				Number(equipment.rentalPricePerDay),
				bookingData.rentalStartDate,
				bookingData.rentalEndDate,
			);

			return await this.servicesRepository.bookEquipmentRental({
				...bookingData,
				totalPrice: String(equipmentRentalTotalPrice),
				userId,
			});
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			)
				throw new BadRequestException(
					"You already have a pending booking for this equipment on the selected dates. Please complete or cancel it before making a new booking.",
				);

			throw error;
		}
	}

	async getEquipmentRentalTotalPrice(
		equipmentRentalId: string,
		rentalStartDate: string,
		rentalEndDate: string,
	) {
		const equipment =
			await this.servicesRepository.getEquipmentRentalById(equipmentRentalId);

		if (!equipment) {
			throw new NotFoundException("Equipment rental not found");
		}

		const equipmentTotalPrice = calculateEquipmentTotalPrice(
			Number(equipment.rentalPricePerDay),
			String(rentalStartDate),
			String(rentalEndDate),
		);

		return { totalPrice: equipmentTotalPrice };
	}

	async createVrgamesPurchaseOrder(
		userId: string,
		orderData: CreateVrGameTicketOrderDto,
	) {
		try {
			const vrgames = await this.servicesRepository.getVrGameById(
				orderData.vrGameId,
			);

			if (!vrgames) {
				throw new NotFoundException("Vrgame not found");
			}

			if (vrgames.ticketQuantity < orderData.ticketQuantity) {
				throw new BadRequestException(
					`Only ${vrgames.ticketQuantity} tickets are available for this VR game.`,
				);
			}

			const bookingDayOfWeek = getDayFromDate(orderData.scheduledDate);

			const vrgameAvailability =
				await this.servicesRepository.getVrgameAvailabilityByIdAndDayofWeek(
					orderData.vrGameId,
					bookingDayOfWeek,
				);

			if (!vrgameAvailability) {
				throw new NotFoundException(
					"Vrgame is not available on the selected day",
				);
			}

			const vrgameTotalPrice =
				Number(vrgames.ticketPrice) * Number(orderData.ticketQuantity);

			if (
				!isWithinInterval(orderData.scheduledTime, {
					start: vrgameAvailability.startTime,
					end: vrgameAvailability.endTime,
				})
			) {
				throw new NotFoundException(
					"Vrgame is not available at the selected time",
				);
			}

			return await this.servicesRepository.createVrgameTicketOrder({
				vrgameId: orderData.vrGameId,
				scheduledDate: orderData.scheduledDate,
				scheduledTime: orderData.scheduledTime,
				totalPrice: String(vrgameTotalPrice),
				userId,
			});
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			)
				throw new BadRequestException(
					"You have a pending booking for this studio. Please complete or cancel it before making a new booking.",
				);

			throw error;
		}
	}
}
