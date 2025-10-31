import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import {
	and,
	asc,
	between,
	desc,
	eq,
	gt,
	gte,
	inArray,
	like,
	lt,
	lte,
	or,
	sql,
} from "drizzle-orm";
import {
	advertBanners,
	cinemaMovies,
	cinemaMoviesShowtimes,
	cinemaMoviesToGenres,
	CreateEquipmentRentalCart,
	CreateFoodCart,
	CreateFoodCartAddon,
	CreateHotelCart,
	CreateMovieTicketCart,
	CreateStudioSessionCart,
	CreateVRGameTicketCart,
	equipmentCategories,
	equipmentRentals,
	equipmentRentalsCart,
	foodAddonCategories,
	foodAddonsItems,
	foodCart,
	foodCartAddons,
	foodCategories,
	foods,
	foodToAddonsCategories,
	hotelCart,
	hotelRooms,
	hotels,
	moviesTicketCart,
	moviesTicketSnacksCart,
	studioAvailability,
	studios,
	studioSessionCart,
	vrgames,
	vrgamesAvailability,
	vrgamesCategories,
	vrgamesTicketCart,
} from "src/database/schema";
import {
	CreateEquipmentRentalBooking,
	CreateFoodOrder,
	CreateHotelBooking,
	CreateMovieTicketPurchase,
	CreateOrder,
	CreateStudioSessionBooking,
	CreateVRGameTicketPurchase,
	equipmentRentalBookings,
	foodOrders,
	hotelBookings,
	movieTicketPurchases,
	Orders,
	studioSessionBookings,
	vrgameTicketPurchases,
} from "src/database/schema/payment";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { MySql2QueryResultHKT } from "drizzle-orm/mysql2";
import { MysqlTransaction } from "src/common/helpers";

@Injectable()
export class ServicesRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async getFoodCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(foodCategories)
			.limit(limit)
			.offset(offset);

		return categories;
	}

	async getFoodById(id: string) {
		const food = await this.databaseService.db.query.foods.findFirst({
			where: eq(foods.id, id),
			with: {
				category: {
					columns: {
						createdAt: false,
						updatedAt: false,
					},
				},
				addons: {
					columns: {
						createdAt: false,
						updatedAt: false,
						foodId: false,
						addonCategoryId: false,
					},
					with: {
						category: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
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
				},
			},
		});

		return {
			...food,
			addons: food?.addons.map((addon) => ({
				...addon.category,
				items: addon.category.items,
			})),
		};
	}

	async getAllFoods({
		offset,
		limit,
		categoryId,
		search,
	}: { offset: number; limit: number; categoryId?: number; search?: string }) {
		// Old way using relations (Didn't work with mariadb on cpanel)
		// const result = await this.databaseService.db.query.foods.findMany({
		// 	where: (foods, { and, like }) =>
		// 		and(
		// 			categoryId ? eq(foods.categoryId, categoryId) : undefined,
		// 			search ? like(foods.name, `%${search}%`) : undefined,
		// 			eq(foods.isAvailable, true),
		// 		),
		// 	with: {
		// 		category: {
		// 			columns: {
		// 				createdAt: false,
		// 				updatedAt: false,
		// 			},
		// 		},
		// 		addons: {
		// 			columns: {
		// 				createdAt: false,
		// 				updatedAt: false,
		// 				foodId: false,
		// 				addonCategoryId: false,
		// 			},
		// 			with: {
		// 				category: {
		// 					columns: {
		// 						createdAt: false,
		// 						updatedAt: false,
		// 					},
		// 					with: {
		// 						items: {
		// 							columns: {
		// 								createdAt: false,
		// 								updatedAt: false,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// 	limit,
		// 	offset,
		// 	orderBy: (foods, { desc }) => [desc(foods.createdAt)],
		// });

		const result = await this.databaseService.db
			.select({
				id: foods.id,
				name: foods.name,
				description: foods.description,
				price: foods.price,
				imageUrls: foods.imageUrls,
				categoryId: foods.categoryId,
				isAvailable: foods.isAvailable,
				category: {
					id: foodCategories.id,
					name: foodCategories.name,
				},
				addons: sql<{
					id: string;
					name: string;
					items: { id: string; name: string; price: number }[];
				}>`CASE 
    WHEN COUNT(${foodAddonCategories.id}) = 0 
    THEN JSON_ARRAY()
    ELSE JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', ${foodAddonCategories.id},
            'name', ${foodAddonCategories.name},
            'description', ${foodAddonCategories.description},
            'items', COALESCE((
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', items.id,
                        'name', items.name,
                        'price', items.price
                    )
                )
                FROM ${foodAddonsItems} AS items
                WHERE items.category_id = ${foodAddonCategories.id}
            ), JSON_ARRAY())
        )
    )
END`.as("addons"),
			})
			.from(foods)
			.leftJoin(foodCategories, eq(foods.categoryId, foodCategories.id))
			.leftJoin(
				foodToAddonsCategories,
				eq(foodToAddonsCategories.foodId, foods.id),
			)
			.leftJoin(
				foodAddonCategories,
				eq(foodToAddonsCategories.addonCategoryId, foodAddonCategories.id),
			)
			.where(
				and(
					categoryId ? eq(foods.categoryId, categoryId) : undefined,
					search ? like(foods.name, `%${search}%`) : undefined,
					eq(foods.isAvailable, true),
				),
			)
			.groupBy(foods.id, foodCategories.id, foodCategories.name)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(foods.createdAt));

		return result;
	}

	async getAllAdvertBanners(offset: number, limit: number) {
		const banners = await this.databaseService.db
			.select()
			.from(advertBanners)
			.where(eq(advertBanners.isPublished, true))
			.limit(limit)
			.offset(offset)
			.orderBy(desc(advertBanners.createdAt));

		return banners;
	}

	async getAllVrGameCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(vrgamesCategories)
			.limit(limit)
			.offset(offset)
			.orderBy(asc(vrgamesCategories.id));

		return categories;
	}

	async getVrGames({
		offset,
		limit,
		categoryId,
		search,
	}: { offset: number; limit: number; categoryId?: number; search?: string }) {
		const vrgamesList = this.databaseService.db
			.select()
			.from(vrgames)
			.where(
				and(
					categoryId ? eq(vrgames.categoryId, categoryId) : undefined,
					search ? like(vrgames.name, `%${search}%`) : undefined,
					eq(vrgames.isAvailable, true),
				),
			)
			.limit(limit)
			.offset(offset);

		return vrgamesList;
	}

	async getVrgameAvailabilityByIdAndDayofWeek(
		vrgameId: string,
		dayOfWeek: number,
	) {
		const availability = await this.databaseService.db
			.select()
			.from(vrgamesAvailability)
			.where(
				and(
					eq(vrgamesAvailability.vrgameId, vrgameId),
					eq(vrgamesAvailability.dayOfWeek, dayOfWeek),
				),
			)
			.limit(1);

		return availability[0];
	}

	async getVrgameAvailabilityByVrgameId(vrgameId: string) {
		const availability = await this.databaseService.db
			.select()
			.from(vrgamesAvailability)
			.where(eq(vrgamesAvailability.vrgameId, vrgameId));

		return availability;
	}

	async getVrGameById(id: string) {
		const vrgame = await this.databaseService.db
			.select()
			.from(vrgames)
			.where(and(eq(vrgames.id, id), eq(vrgames.isAvailable, true)))
			.limit(1);

		return vrgame.pop();
	}

	async getAllHotelAmenities(offset: number, limit: number) {
		const amenities = await this.databaseService.db
			.select()
			.from(sql`hotel_amenities`)
			.limit(limit)
			.offset(offset)
			.orderBy(asc(sql`id`));

		return amenities;
	}

	async getHotelById(id: string) {
		const hotel = await this.databaseService.db.query.hotels.findFirst({
			where: eq(hotels.id, id),
			with: {
				rooms: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
					},
				},
				amenities: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
						amenityId: false,
					},
					with: {
						amenity: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
						},
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

	async getHotels({
		offset,
		limit,
		search,
		coordinates,
		radiusInKm,
	}: {
		offset: number;
		limit: number;
		search?: string;
		coordinates?: { lat?: number; lon?: number };
		radiusInKm?: number;
	}) {
		const hotelsList = await this.databaseService.db.query.hotels.findMany({
			where: (hotels, { and, like }) =>
				and(
					search ? like(hotels.name, `%${search}%`) : undefined,
					eq(hotels.isAvailable, true),
					coordinates?.lat && coordinates.lon && radiusInKm
						? sql`ST_Distance_Sphere(${hotels.coordinates}, ST_GeomFromText('POINT(${coordinates.lat} ${coordinates.lon})',4326)) <= ${radiusInKm * 1000}`
						: undefined,
				),
			columns: {
				createdAt: false,
				updatedAt: false,
			},
			with: {
				rooms: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
					},
				},
				amenities: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
						amenityId: false,
					},
					with: {
						amenity: {
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
			orderBy: (hotels, { desc }) => [desc(hotels.createdAt)],
		});

		const formattedHotels = hotelsList.map((hotel) => ({
			...hotel,
			amenities: hotel.amenities.map((a) => a.amenity),
		}));

		return formattedHotels;
	}

	async getEquipmentRentalById(id: string) {
		const equipment =
			await this.databaseService.db.query.equipmentRentals.findFirst({
				where: and(
					eq(equipmentRentals.id, id),
					eq(equipmentRentals.isAvailable, true),
				),
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
		search,
		categoryId,
	}: { offset: number; limit: number; search?: string; categoryId?: number }) {
		const equipments =
			await this.databaseService.db.query.equipmentRentals.findMany({
				where: (equipmentRentals, { and, like }) =>
					and(
						categoryId
							? eq(equipmentRentals.categoryId, categoryId)
							: undefined,
						search ? like(equipmentRentals.name, `%${search}%`) : undefined,
						eq(equipmentRentals.isAvailable, true),
					),
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
				orderBy: (equipmentRentals, { desc }) => [
					desc(equipmentRentals.createdAt),
				],
			});

		return equipments;
	}

	async getEquipmentCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(equipmentCategories)
			.limit(limit)
			.offset(offset)
			.orderBy(asc(equipmentCategories.id));
		return categories;
	}

	async getUpcomingMovies({
		offset,
		limit,
		search,
		genreId,
	}: { offset: number; limit: number; search?: string; genreId?: number }) {
		const movies = await this.databaseService.db.query.cinemaMovies.findMany({
			where: and(
				inArray(
					cinemaMovies.id,
					this.databaseService.db
						.select({ movieId: cinemaMoviesShowtimes.movieId })
						.from(cinemaMoviesShowtimes)
						.where(
							and(
								gt(cinemaMoviesShowtimes.showDate, sql`CURDATE()`),
								eq(cinemaMoviesShowtimes.isAvailable, true),
							),
						)
						.orderBy(cinemaMoviesShowtimes.showDate)
						.groupBy(cinemaMoviesShowtimes.movieId),
				),
				search ? like(cinemaMovies.title, `%${search}%`) : undefined,
				genreId
					? inArray(
							cinemaMovies.id,
							this.databaseService.db
								.select({ movieId: cinemaMoviesToGenres.movieId })
								.from(cinemaMoviesToGenres)
								.where(eq(cinemaMoviesToGenres.genreId, genreId)),
						)
					: undefined,
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
				snacks: {
					columns: {
						createdAt: false,
						updatedAt: false,
						movieId: false,
						snackId: false,
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
			snacks: movie.snacks.map((s) => s.snack),
		}));
	}

	async getMoviesByShowtime({
		currentDate,
		offset,
		limit,
		search,
		genreId,
	}: {
		currentDate: string;
		offset: number;
		limit: number;
		search?: string;
		genreId?: number;
	}) {
		const movies = await this.databaseService.db.query.cinemaMovies.findMany({
			where: and(
				inArray(
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
								eq(cinemaMoviesShowtimes.isAvailable, true),
							),
						)
						.orderBy(cinemaMoviesShowtimes.showtime)
						.groupBy(cinemaMoviesShowtimes.movieId),
				),
				search ? like(cinemaMovies.title, `%${search}%`) : undefined,
				genreId
					? inArray(
							cinemaMovies.id,
							this.databaseService.db
								.select({ movieId: cinemaMoviesToGenres.movieId })
								.from(cinemaMoviesToGenres)
								.where(eq(cinemaMoviesToGenres.genreId, genreId)),
						)
					: undefined,
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
				snacks: {
					columns: {
						createdAt: false,
						updatedAt: false,
						movieId: false,
						snackId: false,
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
			snacks: movie.snacks.map((s) => s.snack),
		}));
	}

	async getMovieByShowtimeId(showtimeId: number) {
		const showtime =
			await this.databaseService.db.query.cinemaMoviesShowtimes.findFirst({
				where: eq(cinemaMoviesShowtimes.id, showtimeId),
				with: {
					movie: {
						with: {
							snacks: {
								columns: {
									createdAt: false,
									updatedAt: false,
									movieId: false,
									snackId: false,
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
					},
				},
			});

		if (!showtime) {
			return null;
		}

		return {
			ticketPrice: showtime.ticketPrice,
			availableTickets: showtime.totalSeats,
			snacks: showtime.movie.snacks.map((s) => s.snack),
		};
	}

	async getAllStudios({
		search,
		offset,
		limit,
	}: { search?: string; offset: number; limit: number }) {
		return await this.databaseService.db
			.select()
			.from(studios)
			.where(
				and(
					eq(studios.isAvailable, true),
					search ? like(studios.name, `%${search}%`) : undefined,
				),
			)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(studios.createdAt));
	}

	async getStudioById(id: number) {
		const studio = await this.databaseService.db.query.studios.findFirst({
			where: and(eq(studios.id, id), eq(studios.isAvailable, true)),
		});
		return studio;
	}

	async getStudioAvailabilityByIdAndDayofWeek(
		studioId: number,
		dayOfWeek: number,
	) {
		const availability = await this.databaseService.db
			.select()
			.from(studioAvailability)
			.where(
				and(
					eq(studioAvailability.studioId, studioId),
					eq(studioAvailability.dayOfWeek, dayOfWeek),
				),
			)
			.limit(1);

		return availability[0];
	}

	async getStudioAvailabilityByStudioId(studioId: number) {
		const availability = await this.databaseService.db
			.select()
			.from(studioAvailability)
			.where(eq(studioAvailability.studioId, studioId));

		return availability;
	}

	async getBookedStudioSessionsByDate(studioId: number, date: string) {
		const bookings = await this.databaseService.db
			.select({
				bookingDate: studioSessionCart.bookingDate,
				startTime: studioSessionCart.startTime,
				endTime: studioSessionCart.endTime,
			})
			.from(studioSessionCart)
			.where(
				and(
					eq(studioSessionCart.studioId, studioId),
					eq(studioSessionCart.status, "pending"),
					eq(sql`DATE(${studioSessionCart.bookingDate})`, sql`DATE(${date})`),
				),
			)
			.orderBy(asc(studioSessionCart.startTime));

		return bookings;
	}

	async getBookedStudioSessionsByDateRange(
		studioId: number,
		startDate: string,
		endDate: string,
	) {
		const bookings = await this.databaseService.db
			.select({
				bookingDate: studioSessionCart.bookingDate,
				startTime: studioSessionCart.startTime,
				endTime: studioSessionCart.endTime,
			})
			.from(studioSessionCart)
			.where(
				and(
					eq(studioSessionCart.studioId, studioId),
					eq(studioSessionCart.status, "pending"),
					between(studioSessionCart.bookingDate, startDate, endDate),
				),
			)
			.orderBy(
				asc(studioSessionCart.bookingDate),
				asc(studioSessionCart.startTime),
			);

		return bookings;
	}

	async bookStudioSession(bookingData: CreateStudioSessionCart) {
		const booking = await this.databaseService.db
			.insert(studioSessionCart)
			.values(bookingData)
			.$returningId();

		return booking[0];
	}

	async bookEquipmentRental(bookingData: CreateEquipmentRentalCart) {
		const booking = await this.databaseService.db
			.insert(equipmentRentalsCart)
			.values(bookingData)
			.$returningId();

		return booking[0];
	}

	async updateEquipmentRentalBooking({
		bookingId,
		userId,
		quantity,
		totalPrice,
	}: {
		bookingId: string;
		userId: string;
		quantity: number;
		totalPrice: string;
	}) {
		const updatedBooking = await this.databaseService.db
			.update(equipmentRentalsCart)
			.set({
				quantity,
				totalPrice,
			})
			.where(
				and(
					eq(equipmentRentalsCart.id, bookingId),
					eq(equipmentRentalsCart.userId, userId),
				),
			);

		return updatedBooking[0];
	}

	async createVrgameTicketOrder(orderData: CreateVRGameTicketCart) {
		const order = await this.databaseService.db
			.insert(vrgamesTicketCart)
			.values(orderData)
			.$returningId();

		return order[0];
	}

	async updateVrgameTicketOrder({
		userId,
		orderId,
		ticketQuantity,
		totalPrice,
	}: {
		orderId: string;
		userId: string;
		ticketQuantity: number;
		totalPrice: string;
	}) {
		const updatedOrder = await this.databaseService.db
			.update(vrgamesTicketCart)
			.set({
				ticketQuantity,
				totalPrice,
			})
			.where(
				and(
					eq(vrgamesTicketCart.id, orderId),
					eq(vrgamesTicketCart.userId, userId),
				),
			);

		return updatedOrder[0];
	}

	async createMovieTicketOrder(
		movieOrderData: CreateMovieTicketCart,
		movieSnackOrderData: {
			snackId: number;
			quantity: number;
		}[] = [],
	) {
		const movieOrder = await this.databaseService.db.transaction(async (tx) => {
			const order = await tx
				.insert(moviesTicketCart)
				.values(movieOrderData)
				.$returningId();

			if (movieSnackOrderData.length > 0) {
				const snacksDataWithOrderId = movieSnackOrderData.map((snack) => ({
					...snack,
					ticketCartId: order[0].id,
				}));

				await tx.insert(moviesTicketSnacksCart).values(snacksDataWithOrderId);
			}

			return order[0];
		});

		return movieOrder;
	}

	async updateMovieTicketOrder({
		userId,
		orderId,
		ticketQuantity,
		totalPrice,
	}: {
		orderId: string;
		userId: string;
		ticketQuantity: number;
		totalPrice: string;
	}) {
		const updatedOrder = await this.databaseService.db
			.update(moviesTicketCart)
			.set({
				ticketQuantity,
				totalPrice,
			})
			.where(
				and(
					eq(moviesTicketCart.id, orderId),
					eq(moviesTicketCart.userId, userId),
				),
			);

		return updatedOrder[0];
	}

	async createHotelBooking(createHotelBookingData: CreateHotelCart) {
		const booking = await this.databaseService.db
			.insert(hotelCart)
			.values(createHotelBookingData)
			.$returningId();

		return booking[0];
	}

	async checkHotelRoomAvailability(
		hotelId: string,
		roomId: string,
		checkInDate: string,
		checkOutDate: string,
	) {
		const overlappingBookings = await this.databaseService.db
			.select()
			.from(hotelCart)
			.where(
				and(
					eq(hotelCart.hotelId, hotelId),
					eq(hotelCart.hotelRoomId, roomId),
					eq(hotelCart.status, "confirmed"),
					or(
						and(
							gte(hotelCart.checkInDate, checkInDate),
							lt(hotelCart.checkInDate, checkOutDate),
						),
						and(
							gt(hotelCart.checkOutDate, checkInDate),
							lte(hotelCart.checkOutDate, checkOutDate),
						),
						and(
							lte(hotelCart.checkInDate, checkInDate),
							gte(hotelCart.checkOutDate, checkOutDate),
						),
					),
				),
			)
			.leftJoin(hotelRooms, eq(hotelCart.hotelRoomId, hotelRooms.id));

		return overlappingBookings.length === 0;
	}

	async getHotelRoomById(roomId: string) {
		const room = await this.databaseService.db.query.hotelRooms.findFirst({
			where: eq(hotelRooms.id, roomId),
		});

		return room;
	}

	async createFoodOrder(
		foodOrderData: CreateFoodCart,
		foodOrderAddonData: {
			addonCategoryId: number;
			addonItemIds: number[];
		}[] = [],
	) {
		const foodOrder = await this.databaseService.db.transaction(async (tx) => {
			const order = await tx
				.insert(foodCart)
				.values(foodOrderData)
				.$returningId();

			if (foodOrderAddonData.length > 0) {
				const addonsDataWithOrderId: CreateFoodCartAddon[] =
					foodOrderAddonData.flatMap((addon) =>
						addon.addonItemIds.map((itemId) => ({
							foodCartId: order[0].id,
							addonCategoryId: addon.addonCategoryId,
							addonItemId: itemId,
						})),
					);

				await tx.insert(foodCartAddons).values(addonsDataWithOrderId);
			}

			return order[0];
		});

		return foodOrder;
	}

	async updateFoodOrder({
		userId,
		orderId,
		quantity,
		totalPrice,
	}: {
		orderId: string;
		userId: string;
		quantity: number;
		totalPrice: string;
	}) {
		const updatedOrder = await this.databaseService.db
			.update(foodCart)
			.set({
				quantity,
				totalPrice,
			})
			.where(and(eq(foodCart.id, orderId), eq(foodCart.userId, userId)));

		return updatedOrder[0];
	}

	async createOrder(orderData: CreateOrder, transaction: MysqlTransaction) {
		const order = await transaction
			.insert(Orders)
			.values(orderData)
			.$returningId();

		return order[0];
	}

	async createHotelBookingsBulk(
		bookingsData: CreateHotelBooking[],
		transaction: MysqlTransaction,
	) {
		const bookings = await transaction
			.insert(hotelBookings)
			.values(bookingsData)
			.$returningId();

		return bookings;
	}

	async createFoodOrdersBulk(
		ordersData: CreateFoodOrder[],
		transaction: MysqlTransaction,
	) {
		const orders = await transaction
			.insert(foodOrders)
			.values(ordersData)
			.$returningId();

		return orders;
	}

	async createMovieTicketPurchaseRecord(
		purchaseData: CreateMovieTicketPurchase[],
		transaction: MysqlTransaction,
	) {
		const purchases = await transaction
			.insert(movieTicketPurchases)
			.values(purchaseData)
			.$returningId();

		return purchases;
	}

	async createVrgameTicketPurchaseRecord(
		purchaseData: CreateVRGameTicketPurchase[],
		transaction: MysqlTransaction,
	) {
		const purchases = await transaction
			.insert(vrgameTicketPurchases)
			.values(purchaseData)
			.$returningId();

		return purchases;
	}

	async createEquipmentRentalBookingRecord(
		bookingData: CreateEquipmentRentalBooking[],
		transaction: MysqlTransaction,
	) {
		const purchases = await transaction
			.insert(equipmentRentalBookings)
			.values(bookingData)
			.$returningId();

		return purchases;
	}

	async createStudioSessionBookingRecord(
		bookingData: CreateStudioSessionBooking[],
		transaction: MysqlTransaction,
	) {
		const bookings = await transaction
			.insert(studioSessionBookings)
			.values(bookingData)
			.$returningId();

		return bookings;
	}
}
