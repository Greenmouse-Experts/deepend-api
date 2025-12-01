import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ServicesRepository } from "./service.repository";
import {
	BookEquipmentRentalDto,
	BookHotelDto,
	BookStudioSessionDto,
	CreateFoodOrderDto,
	CreateMovieTicketOrderDto,
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
import { format, isWithinInterval, parse } from "date-fns";
import { UserService } from "../user/user.service";
import Decimal from "decimal.js";

@Injectable()
export class ServicesService {
	constructor(
		private readonly servicesRepository: ServicesRepository,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
	) {}

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

	async validateStudioSession(bookingId: string, userId: string) {
		const booking = await this.userService.getUserStudioBookingById(
			bookingId,
			userId,
		);

		if (!booking) {
			throw new NotFoundException("Studio booking not found");
		}

		const studio = await this.servicesRepository.getStudioById(
			booking.studioId,
		);

		if (!studio) {
			throw new NotFoundException("Studio not found");
		}

		const studioAvailability =
			await this.servicesRepository.getStudioAvailabilityByIdAndDayofWeek(
				booking.studioId,
				getDayFromDate(booking.bookingDate),
			);

		if (!studioAvailability) {
			throw new NotFoundException(
				`Studio booking ${studio.name} on ${booking.bookingDate} is not available on the selected day`,
			);
		}

		if (
			!isBookingWithinStudioHours(
				booking.startTime,
				booking.endTime,
				studioAvailability.startTime,
				studioAvailability.endTime,
			)
		) {
			throw new NotFoundException(
				"Studio is not available at the selected time",
			);
		}

		const studioTotalPrice = calculateStudioTotalPrice(
			Number(studio.hourlyRate),
			format(parse(booking.startTime, "HH:mm:ss", new Date()), "HH:mm"),
			format(parse(booking.endTime, "HH:mm:ss", new Date()), "HH:mm"),
		);

		return { ...booking, totalPrice: studioTotalPrice };
	}

	async getStudioSessionTotalPriceById(bookingId: string, userId: string) {
		const booking = await this.userService.getUserStudioBookingById(
			bookingId,
			userId,
		);

		if (!booking) {
			throw new NotFoundException("Studio booking not found");
		}

		const studio = await this.servicesRepository.getStudioById(
			booking.studioId,
		);

		if (!studio) {
			throw new NotFoundException("Studio not found");
		}

		const studioTotalPrice = calculateStudioTotalPrice(
			Number(studio.hourlyRate),
			format(parse(booking.startTime, "HH:mm:ss", new Date()), "HH:mm"),
			format(parse(booking.endTime, "HH:mm:ss", new Date()), "HH:mm"),
		);

		return { totalPrice: studioTotalPrice };
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

			if (equipment.quantityAvailable < bookingData.quantity) {
				throw new BadRequestException(
					`Only ${equipment.quantityAvailable} units are available for this equipment rental.`,
				);
			}

			const equipmentRentalTotalPrice =
				calculateEquipmentTotalPrice(
					Number(equipment.rentalPricePerDay),
					bookingData.rentalStartDate,
					bookingData.rentalEndDate,
				) * Number(bookingData.quantity);

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

	async validateEquipmentRental(bookingId: string, userId: string) {
		const booking = await this.userService.getUserEquipmentRentalBookingById(
			bookingId,
			userId,
		);

		if (!booking) {
			throw new NotFoundException("Equipment rental booking not found");
		}

		const equipment = await this.servicesRepository.getEquipmentRentalById(
			booking.equipmentRentalId as string,
		);

		if (!equipment) {
			throw new NotFoundException("Equipment rental not found");
		}

		if (equipment.quantityAvailable < booking.quantity) {
			throw new BadRequestException(
				`Only ${equipment.quantityAvailable} units are available for this equipment rental.`,
			);
		}

		const equipmentRentalTotalPrice =
			calculateEquipmentTotalPrice(
				Number(equipment.rentalPricePerDay),
				booking.rentalStartDate,
				booking.rentalEndDate,
			) * Number(booking.quantity);

		return { ...booking, totalPrice: equipmentRentalTotalPrice };
	}

	async getEquipmentRentalTotalPrice(
		equipmentRentalId: string,
		rentalStartDate: string,
		rentalEndDate: string,
		quantity: number,
	) {
		const equipment =
			await this.servicesRepository.getEquipmentRentalById(equipmentRentalId);

		if (!equipment) {
			throw new NotFoundException("Equipment rental not found");
		}

		const equipmentRentalTotalPrice =
			calculateEquipmentTotalPrice(
				Number(equipment.rentalPricePerDay),
				rentalStartDate,
				rentalEndDate,
			) * Number(quantity);

		return { totalPrice: equipmentRentalTotalPrice };
	}

	async getEquipmentRentalTotalPriceById(bookingId: string, userId: string) {
		const booking = await this.userService.getUserEquipmentRentalBookingById(
			bookingId,
			userId,
		);

		if (!booking) {
			throw new NotFoundException("Equipment rental booking not found");
		}

		const equipment = await this.servicesRepository.getEquipmentRentalById(
			booking.equipmentRentalId as string,
		);

		if (!equipment) {
			throw new NotFoundException("Equipment rental not found");
		}

		const equipmentRentalTotalPrice =
			calculateEquipmentTotalPrice(
				Number(equipment.rentalPricePerDay),
				booking.rentalStartDate,
				booking.rentalEndDate,
			) * Number(booking.quantity);

		return { totalPrice: equipmentRentalTotalPrice };
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
				!isWithinInterval(
					parse(`${orderData.scheduledTime}:00`, "HH:mm:ss", new Date()),
					{
						start: parse(vrgameAvailability.startTime, "HH:mm:ss", new Date()),
						end: parse(vrgameAvailability.endTime, "HH:mm:ss", new Date()),
					},
				)
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
					"You have a pending order for this VR game. Please complete or cancel it before making a new order.",
				);

			throw error;
		}
	}

	async updateVrgameTicketOrder({
		orderId,
		userId,
		ticketQuantity,
	}: {
		orderId: string;
		userId: string;
		ticketQuantity: number;
	}) {
		const order = await this.userService.getUserVrgamesTicketPurchaseById(
			orderId,
			userId,
		);

		if (!order) {
			throw new NotFoundException("VR game ticket order not found");
		}

		const vrgame = await this.servicesRepository.getVrGameById(
			order.vrgameId as string,
		);

		if (!vrgame) {
			throw new NotFoundException("VR game not found");
		}

		if (vrgame.ticketQuantity < ticketQuantity) {
			throw new BadRequestException(
				`Only ${vrgame.ticketQuantity} tickets are available for this VR game.`,
			);
		}

		const vrgameTotalPrice =
			Number(vrgame.ticketPrice) * Number(ticketQuantity);

		return await this.servicesRepository.updateVrgameTicketOrder({
			orderId,
			userId,
			ticketQuantity,
			totalPrice: String(vrgameTotalPrice),
		});
	}

	async validateVrgameTicketOrder(orderId: string, userId: string) {
		const order = await this.userService.getUserVrgamesTicketPurchaseById(
			orderId,
			userId,
		);

		if (!order) {
			throw new NotFoundException("VR game ticket order not found");
		}

		const vrgame = await this.servicesRepository.getVrGameById(
			order.vrgameId as string,
		);

		if (!vrgame) {
			throw new NotFoundException("VR game not found");
		}

		const bookingDayOfWeek = getDayFromDate(order.scheduledDate);

		const vrgameAvailability =
			await this.servicesRepository.getVrgameAvailabilityByIdAndDayofWeek(
				order.vrgameId as string,
				bookingDayOfWeek,
			);

		if (!vrgameAvailability) {
			throw new NotFoundException(
				`VR game ${vrgame.name} on ${order.scheduledDate} is not available on the selected day`,
			);
		}

		if (
			!isWithinInterval(
				parse(`${order.scheduledTime}`, "HH:mm:ss", new Date()),
				{
					start: parse(vrgameAvailability.startTime, "HH:mm:ss", new Date()),
					end: parse(vrgameAvailability.endTime, "HH:mm:ss", new Date()),
				},
			)
		) {
			throw new NotFoundException(
				"VR game is not available at the selected time",
			);
		}

		const vrgameTotalPrice = new Decimal(vrgame.ticketPrice)
			.mul(order.ticketQuantity)
			.toNearest(0.01)
			.toNumber();

		return { ...order, totalPrice: vrgameTotalPrice };
	}

	async getVrgameTotalPrice(vrGameId: string, ticketQuantity: number) {
		const vrgame = await this.servicesRepository.getVrGameById(vrGameId);

		if (!vrgame) {
			throw new NotFoundException("VR game not found");
		}

		const vrgameTotalPrice =
			Number(vrgame.ticketPrice) * Number(ticketQuantity);

		return { totalPrice: vrgameTotalPrice };
	}

	async getVrgameSessionTotalPriceById(orderId: string, userId: string) {
		const order = await this.userService.getUserVrgamesTicketPurchaseById(
			orderId,
			userId,
		);

		if (!order) {
			throw new NotFoundException("VR game ticket order not found");
		}

		const vrgame = await this.servicesRepository.getVrGameById(
			order.vrgameId as string,
		);

		if (!vrgame) {
			throw new NotFoundException("VR game not found");
		}

		const vrgameTotalPrice = new Decimal(vrgame.ticketPrice)
			.mul(order.ticketQuantity)
			.toNearest(0.01)
			.toNumber();

		return { totalPrice: vrgameTotalPrice };
	}

	async getVrgameAvailabilityByVrgameId(vrGameId: string) {
		const availability =
			await this.servicesRepository.getVrgameAvailabilityByVrgameId(vrGameId);

		return availability;
	}

	async createMovieTicketOrder(
		userId: string,
		movieTicketOrderData: CreateMovieTicketOrderDto,
	) {
		try {
			const movieShowtime = await this.servicesRepository.getMovieByShowtimeId(
				movieTicketOrderData.movieShowtimeId,
			);

			if (!movieShowtime) {
				throw new NotFoundException("Movie showtime not found");
			}

			if (
				movieShowtime.availableTickets < movieTicketOrderData.ticketQuantity
			) {
				throw new BadRequestException(
					`Only ${movieShowtime.availableTickets} tickets are available for this movie.`,
				);
			}

			const movieSnacksTotalPrice = movieShowtime.snacks.reduce(
				(total, snack) =>
					total +
					Number(snack.price) *
						(movieTicketOrderData.snacks.find((s) => s.snackId === snack.id)
							?.quantity || 0),
				0,
			);
			const movieTotalPrice =
				Number(movieShowtime.ticketPrice) *
					Number(movieTicketOrderData.ticketQuantity) +
				movieSnacksTotalPrice;

			return await this.servicesRepository.createMovieTicketOrder(
				{
					...movieTicketOrderData,
					showtimeId: movieTicketOrderData.movieShowtimeId,
					totalPrice: String(movieTotalPrice),
					userId,
				},
				movieTicketOrderData.snacks,
			);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			)
				throw new BadRequestException(
					"You have a pending order for this movie. Please complete or cancel it before making a new order.",
				);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			)
				throw new BadRequestException(
					"One or more selected snacks or movies do not exist. Please review your order and try again.",
				);

			throw error;
		}
	}

	async validateMovieTicketOrder(orderId: string, userId: string) {
		const order = await this.userService.getUserMovieTicketPurchaseById(
			orderId,
			userId,
		);

		if (!order) {
			throw new NotFoundException("Movie ticket order not found");
		}

		const movieShowtime = await this.servicesRepository.getMovieByShowtimeId(
			order.showtimeId,
		);

		if (!movieShowtime) {
			throw new NotFoundException("Movie showtime not found");
		}

		if (movieShowtime.availableTickets < order.ticketQuantity) {
			throw new BadRequestException(
				`Only ${movieShowtime.availableTickets} tickets are available for this movie.`,
			);
		}

		const movieSnacksTotalPrice = movieShowtime.snacks.reduce(
			(total, snack) =>
				total +
				new Decimal(snack.price)
					.mul(
						order.orderedSnacks.find((s) => s.snackId === snack.id)?.quantity ||
							0,
					)
					.toNearest(0.01)
					.toNumber(),
			0,
		);
		const movieTotalPrice = new Decimal(movieShowtime.ticketPrice)
			.mul(order.ticketQuantity)
			.plus(movieSnacksTotalPrice)
			.toNearest(0.01)
			.toNumber();

		return { ...order, totalPrice: movieTotalPrice };
	}

	async getMovieShowtimeTotalPriceById(orderId: string, userId: string) {
		const order = await this.userService.getUserMovieTicketPurchaseById(
			orderId,
			userId,
		);

		if (!order) {
			throw new NotFoundException("Movie ticket order not found");
		}

		const movieShowtime = await this.servicesRepository.getMovieByShowtimeId(
			order.showtimeId,
		);

		if (!movieShowtime) {
			throw new NotFoundException("Movie showtime not found");
		}

		const movieSnacksTotalPrice = movieShowtime.snacks.reduce(
			(total, snack) =>
				total +
				new Decimal(snack.price)
					.mul(
						order.orderedSnacks.find((s) => s.snackId === snack.id)?.quantity ||
							0,
					)
					.toNearest(0.01)
					.toNumber(),
			0,
		);
		const movieTotalPrice = new Decimal(movieShowtime.ticketPrice)
			.mul(order.ticketQuantity)
			.plus(movieSnacksTotalPrice)
			.toNearest(0.01)
			.toNumber();

		return { totalPrice: movieTotalPrice };
	}
	async createHotelBooking(userId: string, BookingData: BookHotelDto) {
		try {
			const availability =
				await this.servicesRepository.checkHotelRoomAvailability(
					BookingData.hotelId,
					BookingData.hotelRoomId,
					BookingData.checkInDate,
					BookingData.checkOutDate,
				);

			if (!availability) {
				throw new NotFoundException(
					"Hotel room not available for the selected dates.",
				);
			}

			const hotelRoom = await this.servicesRepository.getHotelRoomById(
				BookingData.hotelRoomId,
			);

			if (!hotelRoom) {
				throw new NotFoundException("Hotel room not found");
			}

			const numberOfNights =
				Math.abs(
					new Date(BookingData.checkOutDate).getTime() -
						new Date(BookingData.checkInDate).getTime(),
				) /
				(1000 * 60 * 60 * 24);
			console.log(`Available Hotel ${JSON.stringify(availability)}`);

			const totalPrice =
				Number(hotelRoom.pricePerNight) * Number(numberOfNights);

			return await this.servicesRepository.createHotelBooking({
				...BookingData,
				userId,
				totalPrice: String(totalPrice),
			});
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.DUPLICATE_ENTRY
			)
				throw new BadRequestException(
					"You have a pending booking for this hotel room. Please complete or cancel it before making a new booking.",
				);

			throw error;
		}
	}

	async validateHotelBooking(bookingId: string, userId: string) {
		const booking = await this.userService.getUserHotelBookingById(
			bookingId,
			userId,
		);

		if (!booking) {
			throw new NotFoundException("Hotel booking not found");
		}

		const availability =
			await this.servicesRepository.checkHotelRoomAvailability(
				booking.hotelId as string,
				booking.hotelRoomId as string,
				booking.checkInDate,
				booking.checkOutDate,
			);

		if (!availability) {
			throw new NotFoundException(
				"Hotel room not available for the selected dates.",
			);
		}

		const hotelRoom = await this.servicesRepository.getHotelRoomById(
			booking.hotelRoomId as string,
		);

		if (!hotelRoom) {
			throw new NotFoundException("Hotel room not found");
		}

		const numberOfNights =
			Math.abs(
				new Date(booking.checkOutDate).getTime() -
					new Date(booking.checkInDate).getTime(),
			) /
			(1000 * 60 * 60 * 24);

		const totalPrice = new Decimal(hotelRoom.pricePerNight)
			.mul(numberOfNights)
			.toNearest(0.01)
			.toNumber();

		return { ...booking, totalPrice };
	}

	async getHotelBookingTotalPriceById(bookingId: string, userId: string) {
		const booking = await this.userService.getUserHotelBookingById(
			bookingId,
			userId,
		);

		if (!booking) {
			throw new NotFoundException("Hotel booking not found");
		}

		const hotelRoom = await this.servicesRepository.getHotelRoomById(
			booking.hotelRoomId as string,
		);

		if (!hotelRoom) {
			throw new NotFoundException("Hotel room not found");
		}

		const numberOfNights =
			Math.abs(
				new Date(booking.checkOutDate).getTime() -
					new Date(booking.checkInDate).getTime(),
			) /
			(1000 * 60 * 60 * 24);

		const totalPrice = new Decimal(hotelRoom.pricePerNight)
			.mul(numberOfNights)
			.toNearest(0.01)
			.toNumber();

		return { totalPrice };
	}

	async createFoodOrder(userId: string, foodData: CreateFoodOrderDto) {
		try {
			const foods = await this.servicesRepository.getFoodById(foodData.foodId);

			if (!foods) {
				throw new NotFoundException("Food item not found");
			}

			// @ts-ignore
			if (foods.quantity < foodData.quantity) {
				throw new BadRequestException(
					`Only ${foods.quantity} units are available for this food item.`,
				);
			}

			let foodPrice = Number(foods.price) * Number(foodData.quantity);

			if (foodData.addons && foodData.addons.length > 0) {
				const foodAddOnsPrice = foodData.addons.reduce((total, addon) => {
					// collect all matching add-on items for the given category and item IDs
					const matchingAddOn = (foods.addons || [])
						.flatMap((a) => a.items)
						.filter(
							(item) =>
								item.categoryId === addon.addonCategoryId &&
								addon.addonItemIds.includes(item.id),
						);

					if (matchingAddOn.length !== addon.addonItemIds.length) {
						throw new BadRequestException(
							`One or more selected add-ons do not exist for this food item.`,
						);
					}

					const sumAddOnPrice = matchingAddOn.reduce(
						(sum, item) => sum + Number(item.price || 0),
						0,
					);

					return total + sumAddOnPrice;
				}, 0);

				if (foodAddOnsPrice === 0) {
					throw new BadRequestException(
						`One or more selected add-ons do not exist for this food item.`,
					);
				}

				foodPrice += foodAddOnsPrice;
			}

			return await this.servicesRepository.createFoodOrder(
				{
					foodId: foodData.foodId,
					userId,
					quantity: foodData.quantity,
					totalPrice: String(foodPrice),
					deliveryType: foodData.deliveryType,
					...(foodData.deliveryType === "delivery"
						? { deliveryAddress: foodData.deliveryAddress }
						: {}),
					...(foodData.deliveryType === "delivery" && foodData.deliveryLat
						? { deliveryLat: String(foodData.deliveryLat) }
						: {}),
					...(foodData.deliveryType === "delivery" && foodData.deliveryLng
						? { deliveryLng: String(foodData.deliveryLng) }
						: {}),
					...(foodData.specialInstructions
						? { specialInstructions: foodData.specialInstructions }
						: {}),
				},
				foodData.addons,
			);
		} catch (error) {
			const databaseError = isDatabaseError(error);

			if (
				databaseError.isDatabaseError &&
				databaseError.code === mysqlErrorCodes.FOREIGN_KEY_VIOLATION
			)
				throw new BadRequestException(
					"One or more selected food items do not exist. Please review your order and try again.",
				);

			throw error;
		}
	}

	async validateFoodOrder(orderId: string, userId: string) {
		const order = await this.userService.getUserFoodOrderById(orderId, userId);

		if (!order) {
			throw new NotFoundException("Food order not found");
		}

		const foodItem = await this.servicesRepository.getFoodById(order.foodId);

		if (!foodItem) {
			throw new NotFoundException("Food item not found");
		}

		let foodPrice = new Decimal(foodItem.price || 0)
			.mul(order.quantity)
			.toNearest(0.01)
			.toNumber();

		if (order.foodAddons && order.foodAddons.length > 0) {
			const foodAddOnsPrice = order.foodAddons.reduce((total, addon) => {
				// collect all matching add-on items for the given category and item IDs
				const matchingAddOn = (foodItem.addons || [])
					.flatMap((a) => a.items)
					.filter(
						(item) =>
							item.categoryId === addon.categoryId && addon.id === item.id,
					);

				if (matchingAddOn.length === 0) {
					throw new BadRequestException(
						`One or more selected add-ons do not exist for this food item.`,
					);
				}

				const sumAddOnPrice = matchingAddOn.reduce(
					(sum, item) => sum + Number(item.price || 0),
					0,
				);

				return total + sumAddOnPrice;
			}, 0);

			if (foodAddOnsPrice === 0) {
				throw new BadRequestException(
					`One or more selected add-ons do not exist for this food item.`,
				);
			}

			foodPrice += foodAddOnsPrice;
		}

		return { ...order, totalPrice: foodPrice };
	}

	async getFoodOrderTotalPriceById(orderId: string, userId: string) {
		const order = await this.userService.getUserFoodOrderById(orderId, userId);

		if (!order) {
			throw new NotFoundException("Food order not found");
		}

		const foodItem = await this.servicesRepository.getFoodById(order.foodId);

		if (!foodItem) {
			throw new NotFoundException("Food item not found");
		}

		let foodPrice = new Decimal(foodItem.price || 0)
			.mul(order.quantity)
			.toNearest(0.01)
			.toNumber();

		if (order.foodAddons && order.foodAddons.length > 0) {
			const foodAddOnsPrice = order.foodAddons.reduce((total, addon) => {
				// collect all matching add-on items for the given category and item IDs
				const matchingAddOn = (foodItem.addons || [])
					.flatMap((a) => a.items)
					.filter(
						(item) =>
							item.categoryId === addon.categoryId && addon.id === item.id,
					);

				if (matchingAddOn.length === 0) {
					throw new BadRequestException(
						`One or more selected add-ons do not exist for this food item.`,
					);
				}

				const sumAddOnPrice = matchingAddOn.reduce(
					(sum, item) =>
						new Decimal(sum)
							.plus(item.price || 0)
							.toNearest(0.01)
							.toNumber(),
					0,
				);

				return new Decimal(total)
					.plus(sumAddOnPrice)
					.toNearest(0.01)
					.toNumber();
			}, 0);

			if (foodAddOnsPrice === 0) {
				throw new BadRequestException(
					`One or more selected add-ons do not exist for this food item.`,
				);
			}

			foodPrice += foodAddOnsPrice;
		}

		return { totalPrice: foodPrice };
	}

	async updateUserCartItemQuantity({
		userId,
		cartItemId,
		cartItemType,
		quantity,
	}: {
		userId: string;
		cartItemId: string;
		cartItemType: string;
		quantity: number;
	}) {
		switch (cartItemType) {
			case "vrgame":
				const order = await this.userService.getUserVrgamesTicketPurchaseById(
					cartItemId,
					userId,
				);

				if (!order) {
					throw new NotFoundException("VR game ticket order not found");
				}

				const vrgame = await this.servicesRepository.getVrGameById(
					order.vrgameId as string,
				);

				if (!vrgame) {
					throw new NotFoundException("VR game not found");
				}

				if (vrgame.ticketQuantity < quantity) {
					throw new BadRequestException(
						`Only ${vrgame.ticketQuantity} tickets are available for this VR game.`,
					);
				}

				const vrgameTotalPrice = Number(vrgame.ticketPrice) * Number(quantity);

				return await this.servicesRepository.updateVrgameTicketOrder({
					orderId: cartItemId,
					userId,
					ticketQuantity: quantity,
					totalPrice: String(vrgameTotalPrice),
				});
			case "movie":
				const movieOrder =
					await this.userService.getUserMovieTicketPurchaseById(
						cartItemId,
						userId,
					);

				if (!movieOrder) {
					throw new NotFoundException("Movie ticket order not found");
				}

				const movieShowtime =
					await this.servicesRepository.getMovieByShowtimeId(
						movieOrder.showtimeId,
					);

				if (!movieShowtime) {
					throw new NotFoundException("Movie showtime not found");
				}

				if (movieShowtime.availableTickets < quantity) {
					throw new BadRequestException(
						`Only ${movieShowtime.availableTickets} tickets are available for this movie.`,
					);
				}

				const movieSnacksTotalPrice = movieShowtime.snacks.reduce(
					(total, snack) =>
						total +
						Number(snack.price) *
							(movieOrder.orderedSnacks.find((s) => s.snackId === snack.id)
								?.quantity || 0),
					0,
				);
				const movieTotalPrice =
					Number(movieShowtime.ticketPrice) * Number(quantity) +
					movieSnacksTotalPrice;

				return await this.servicesRepository.updateMovieTicketOrder({
					orderId: cartItemId,
					userId,
					ticketQuantity: quantity,
					totalPrice: String(movieTotalPrice),
				});
			case "food":
				const foodOrder = await this.userService.getUserFoodOrderById(
					cartItemId,
					userId,
				);

				if (!foodOrder) {
					throw new NotFoundException("Food order not found");
				}

				const foodItem = await this.servicesRepository.getFoodById(
					foodOrder.foodId,
				);

				if (!foodItem) {
					throw new NotFoundException("Food item not found");
				}

				// @ts-ignore
				if (foodItem.quantity < quantity) {
					throw new BadRequestException(
						`Only ${foodItem.quantity} units are available for this food item.`,
					);
				}

				let foodPrice = Number(foodItem.price) * Number(quantity);

				if (foodOrder.foodAddons && foodOrder.foodAddons.length > 0) {
					const foodAddOnsPrice = foodOrder.foodAddons.reduce(
						(total, addon) => {
							// collect all matching add-on items for the given category and item IDs
							const matchingAddOn = (foodItem.addons || [])
								.flatMap((a) => a.items)
								.filter(
									(item) =>
										item.categoryId === addon.categoryId &&
										addon.id === item.id,
								);

							const sumAddOnPrice = matchingAddOn.reduce(
								(sum, item) => sum + Number(item.price || 0),
								0,
							);

							return total + sumAddOnPrice;
						},
						0,
					);

					foodPrice += foodAddOnsPrice;
				}

				return await this.servicesRepository.updateFoodOrder({
					orderId: cartItemId,
					userId,
					quantity,
					totalPrice: String(foodPrice),
				});
			case "equipment":
				const equipmentOrder =
					await this.userService.getUserEquipmentRentalBookingById(
						cartItemId,
						userId,
					);

				if (!equipmentOrder) {
					throw new NotFoundException("Equipment rental booking not found");
				}

				const equipment = await this.servicesRepository.getEquipmentRentalById(
					equipmentOrder.equipmentRentalId as string,
				);

				if (!equipment) {
					throw new NotFoundException("Equipment rental not found");
				}

				if (equipment.quantityAvailable < quantity) {
					throw new BadRequestException(
						`Only ${equipment.quantityAvailable} units are available for this equipment rental.`,
					);
				}

				const equipmentRentalTotalPrice =
					calculateEquipmentTotalPrice(
						Number(equipment.rentalPricePerDay),
						equipmentOrder.rentalStartDate,
						equipmentOrder.rentalEndDate,
					) * Number(quantity);

				return await this.servicesRepository.updateEquipmentRentalBooking({
					bookingId: cartItemId,
					userId,
					quantity,
					totalPrice: String(equipmentRentalTotalPrice),
				});

			default:
				throw new BadRequestException("Invalid cart item type");
		}
	}
}
