import { Injectable } from "@nestjs/common";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { DatabaseService } from "src/database/database.service";
import {
	// AddToCartType,
	// cartItems,
	// carts,
	CreateUser,
	users,
	studios,
	vrgames,
	foods,
	hotelRooms,
	equipmentRentals,
	cinemaMoviesShowtimes,
	cinemaMovies,
	vrgamesTicketCart,
	studioSessionCart,
	foodCart,
	hotelCart,
	equipmentRentalsCart,
	moviesTicketCart,
	cinemas,
	cinemaHalls,
	hotels,
} from "src/database/schema";
import {
	EquipmentRentalBookingStatus,
	StudioBookingStatus,
} from "../admin/admin.repository";
import { unionAll } from "drizzle-orm/mysql-core";
import { decrement, MysqlDatabaseTransaction } from "src/common/helpers";
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
	orders,
	studioSessionBookings,
	vrgameTicketPurchases,
} from "src/database/schema/payment";

@Injectable()
export class UserRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async findUserById(id: string) {
		return await this.databaseService.db.query.users.findFirst({
			where: eq(users.id, id),
		});
	}

	async findUserEmailByUserId(id: string) {
		return await this.databaseService.db.query.users.findFirst({
			where: eq(users.id, id),
			columns: {
				email: true,
			},
		});
	}

	async findUserByEmail(email: string) {
		return await this.databaseService.db.query.users.findFirst({
			where: eq(users.email, email),
		});
	}

	async createUser(
		userData: Omit<CreateUser, "id" | "createdAt" | "updatedAt">,
	) {
		const newUser = await this.databaseService.db
			.insert(users)
			.values(userData)
			.$returningId();

		return newUser.pop();
	}

	async updateUser(
		id: string,
		updateData: Partial<Omit<CreateUser, " id" | "createdAt" | "updatedAt">>,
	) {
		await this.databaseService.db
			.update(users)
			.set(updateData)
			.where(eq(users.id, id));
	}

	async getUserStudioBookings({
		userId,
		offset,
		limit,
		status,
	}: {
		userId: string;
		offset: number;
		limit: number;
		status?: StudioBookingStatus;
	}) {
		const bookings =
			await this.databaseService.db.query.studioSessionCart.findMany({
				where: (table, { and }) =>
					and(
						eq(table.userId, userId),
						status ? eq(table.status, status) : undefined,
					),
				limit,
				offset,
				with: {
					studio: true,
				},
			});

		return bookings;
	}

	async getUserStudioBookingById(bookingId: string, userId: string) {
		const booking =
			await this.databaseService.db.query.studioSessionCart.findFirst({
				where: (table, { and }) =>
					and(eq(table.id, bookingId), eq(table.userId, userId)),
				with: {
					studio: true,
				},
				columns: {
					totalPrice: false,
					createdAt: false,
					updatedAt: false,
				},
			});

		return booking;
	}

	async deleteUserStudioBookingById(bookingId: string, userId: string) {
		return await this.databaseService.db
			.delete(studioSessionCart)
			.where(
				and(
					eq(studioSessionCart.id, bookingId),
					eq(studioSessionCart.userId, userId),
				),
			);
	}

	async getUserEquipmentRentalBookings({
		userId,
		offset,
		limit,
		status,
	}: {
		userId: string;
		offset: number;
		limit: number;
		status?: EquipmentRentalBookingStatus;
	}) {
		const bookings =
			await this.databaseService.db.query.equipmentRentalsCart.findMany({
				where: (table, { and }) =>
					and(
						eq(table.userId, userId),
						status ? eq(table.status, status) : undefined,
					),
				limit,
				offset,
			});

		return bookings;
	}

	async getUserEquipmentRentalBookingById(bookingId: string, userId: string) {
		const booking =
			await this.databaseService.db.query.equipmentRentalsCart.findFirst({
				where: (table, { and }) =>
					and(eq(table.id, bookingId), eq(table.userId, userId)),
				columns: {
					totalPrice: false,
					createdAt: false,
					updatedAt: false,
				},
				with: {
					equipmentRental: {
						columns: {
							createdAt: false,
							updatedAt: false,
							isAvailable: false,
						},
					},
				},
			});

		return booking;
	}

	async deleteUserEquipmentRentalBookingById(
		bookingId: string,
		userId: string,
	) {
		return await this.databaseService.db
			.delete(equipmentRentalsCart)
			.where(
				and(
					eq(equipmentRentalsCart.id, bookingId),
					eq(equipmentRentalsCart.userId, userId),
				),
			);
	}

	async getUserVrgamesTicketPurchases({
		userId,
		offset,
		limit,
		status,
	}: {
		userId: string;
		offset: number;
		limit: number;
		status?: "pending" | "completed" | "cancelled";
	}) {
		const purchases =
			await this.databaseService.db.query.vrgamesTicketCart.findMany({
				where: (table, { and }) =>
					and(
						eq(table.userId, userId),
						status ? eq(table.status, status) : undefined,
					),
				limit,
				offset,
			});

		return purchases;
	}

	async getUserVrgamesTicketPurchaseById(purchaseId: string, userId: string) {
		const purchase =
			await this.databaseService.db.query.vrgamesTicketCart.findFirst({
				where: (table, { and }) =>
					and(eq(table.id, purchaseId), eq(table.userId, userId)),
				columns: {
					totalPrice: false,
					createdAt: false,
					updatedAt: false,
				},
				with: {
					vrgame: {
						columns: {
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
					},
				},
			});

		return purchase;
	}

	async deleteUserVrgamesTicketPurchaseById(
		purchaseId: string,
		userId: string,
	) {
		return await this.databaseService.db
			.delete(vrgamesTicketCart)
			.where(
				and(
					eq(vrgamesTicketCart.id, purchaseId),
					eq(vrgamesTicketCart.userId, userId),
				),
			);
	}

	async getUserMovieTicketPurchases({
		userId,
		offset,
		limit,
		status,
	}: {
		userId: string;
		offset: number;
		limit: number;
		status?: "pending" | "completed" | "cancelled";
	}) {
		const purchases =
			await this.databaseService.db.query.moviesTicketCart.findMany({
				where: (table, { and }) =>
					and(
						eq(table.userId, userId),
						status ? eq(table.status, status) : undefined,
					),
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

	async getUserMovieTicketPurchaseById(purchaseId: string, userId: string) {
		const purchase =
			await this.databaseService.db.query.moviesTicketCart.findFirst({
				where: (table, { and }) =>
					and(eq(table.id, purchaseId), eq(table.userId, userId)),
				columns: {
					totalPrice: false,
					createdAt: false,
					updatedAt: false,
				},
				with: {
					showtime: {
						columns: {
							totalSeats: false,
							isAvailable: false,
							createdAt: false,
							updatedAt: false,
						},
						with: {
							movie: {
								columns: {
									createdAt: false,
									updatedAt: false,
								},
								with: {
									genres: {
										columns: {
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
								},
								with: {
									cinema: {
										columns: {
											createdAt: false,
											updatedAt: false,
										},
									},
								},
							},
						},
					},
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

		if (!purchase) {
			return null;
		}

		const { orderedSnacks, ...rest } = purchase;

		return {
			...rest,
			orderedSnacks: orderedSnacks.map((orderedSnack) => ({
				...orderedSnack,
				snack: orderedSnack.snack,
			})),
		};
	}

	async deleteUserMovieTicketPurchaseById(purchaseId: string, userId: string) {
		return await this.databaseService.db
			.delete(moviesTicketCart)
			.where(
				and(
					eq(moviesTicketCart.id, purchaseId),
					eq(moviesTicketCart.userId, userId),
				),
			);
	}

	async getUserHotelBookings({
		userId,
		offset,
		limit,
		status,
	}: {
		userId: string;
		offset: number;
		limit: number;
		status?: "pending" | "confirmed" | "cancelled" | "completed";
	}) {
		const bookings = await this.databaseService.db.query.hotelCart.findMany({
			where: (table, { and }) =>
				and(
					eq(table.userId, userId),
					status ? eq(table.status, status) : undefined,
				),
			limit,
			offset,
		});

		return bookings;
	}

	async getUserHotelBookingById(bookingId: string, userId: string) {
		const booking = await this.databaseService.db.query.hotelCart.findFirst({
			where: (table, { and }) =>
				and(eq(table.id, bookingId), eq(table.userId, userId)),
			columns: {
				totalPrice: false,
				createdAt: false,
				updatedAt: false,
			},
			with: {
				hotel: {
					columns: {
						createdAt: false,
						updatedAt: false,
						coordinates: false,
						isAvailable: false,
					},
				},
				hotelRoom: {
					columns: {
						hotelId: false,
						isAvailable: false,
						createdAt: false,
						updatedAt: false,
					},
				},
			},
		});

		return booking;
	}

	async deleteUserHotelBookingById(bookingId: string, userId: string) {
		return await this.databaseService.db
			.delete(hotelCart)
			.where(and(eq(hotelCart.id, bookingId), eq(hotelCart.userId, userId)));
	}

	async getUserFoodOrders({
		userId,
		offset,
		limit,
		status,
	}: {
		userId: string;
		offset: number;
		limit: number;
		status?: "pending" | "preparing" | "delivered" | "cancelled";
	}) {
		const orders = await this.databaseService.db.query.foodCart.findMany({
			where: (table, { and }) =>
				and(
					eq(table.userId, userId),
					status ? eq(table.status, status) : undefined,
				),
			limit,
			offset,
			with: {
				food: {
					columns: {
						createdAt: false,
						updatedAt: false,
					},
				},
				foodAddons: {
					columns: {
						id: false,
						foodCartId: false,
						addonCategoryId: false,
						addonItemId: false,
						createdAt: false,
						updatedAt: false,
					},
					with: {
						addonItem: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
						},
					},
				},
			},
		});

		const ordersWithDetails = orders.map((order) => {
			const { foodAddons, ...rest } = order;
			return {
				...rest,
				foodAddons: foodAddons.map((foodAddon) => ({
					...foodAddon.addonItem,
				})),
			};
		});

		return ordersWithDetails;
	}

	async getUserFoodOrderById(orderId: string, userId: string) {
		const order = await this.databaseService.db.query.foodCart.findFirst({
			where: (table, { and }) =>
				and(eq(table.id, orderId), eq(table.userId, userId)),
			columns: {
				totalPrice: false,
				createdAt: false,
				updatedAt: false,
			},
			with: {
				food: {
					columns: {
						createdAt: false,
						updatedAt: false,
					},
				},
				foodAddons: {
					columns: {
						id: false,
						foodCartId: false,
						addonCategoryId: false,
						addonItemId: false,
						createdAt: false,
						updatedAt: false,
					},
					with: {
						addonItem: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
						},
					},
				},
			},
		});

		if (!order) {
			return null;
		}

		const { foodAddons, ...rest } = order;

		return {
			...rest,
			foodAddons: foodAddons.map((foodAddon) => ({
				...foodAddon.addonItem,
			})),
		};
	}

	async deleteUserFoodOrderById(orderId: string, userId: string) {
		return await this.databaseService.db
			.delete(foodCart)
			.where(and(eq(foodCart.id, orderId), eq(foodCart.userId, userId)));
	}

	async getUserCartContents(userId: string) {
		const studioCartItem = this.databaseService.db
			.select({
				name: studios.name,
				picture: sql<string>`''`,
				totalPrice: studioSessionCart.totalPrice,
				quantity: sql<number>`1`,
				cartItemId: studioSessionCart.id,
				cartItemType: sql<string>`'studio'`,
			})
			.from(studioSessionCart)
			.leftJoin(studios, eq(studioSessionCart.studioId, studios.id))
			.where(
				and(
					eq(studioSessionCart.userId, userId),
					eq(studioSessionCart.status, "pending"),
				),
			);

		const vrgameCartItem = this.databaseService.db
			.select({
				name: vrgames.name,
				picture: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${vrgames.imageUrls}, '$[0].url')), '')`,
				totalPrice: vrgamesTicketCart.totalPrice,
				quantity: vrgamesTicketCart.ticketQuantity,
				cartItemId: vrgamesTicketCart.id,
				cartItemType: sql<string>`'vrgame'`,
			})
			.from(vrgamesTicketCart)
			.leftJoin(vrgames, eq(vrgamesTicketCart.vrgameId, vrgames.id))
			.where(
				and(
					eq(vrgamesTicketCart.userId, userId),
					eq(vrgamesTicketCart.status, "pending"),
				),
			);

		const foodCartItem = this.databaseService.db
			.select({
				name: foods.name,
				picture: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${foods.imageUrls}, '$[0].url')), '')`,
				totalPrice: foodCart.totalPrice,
				quantity: foodCart.quantity,
				cartItemId: foodCart.id,
				cartItemType: sql<string>`'food'`,
			})
			.from(foodCart)
			.leftJoin(foods, eq(foodCart.foodId, foods.id))
			.where(and(eq(foodCart.userId, userId), eq(foodCart.status, "pending")));

		const hotelCartItem = this.databaseService.db
			.select({
				name: hotelRooms.name,
				picture: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${hotelRooms.imageUrls}, '$[0].url')), '')`,
				totalPrice: hotelCart.totalPrice,
				quantity: sql<number>`1`,
				cartItemId: hotelCart.id,
				cartItemType: sql<string>`'hotel'`,
			})
			.from(hotelCart)
			.leftJoin(hotelRooms, eq(hotelCart.hotelRoomId, hotelRooms.id))
			.where(
				and(eq(hotelCart.userId, userId), eq(hotelCart.status, "pending")),
			);

		const equipmentCartItem = this.databaseService.db
			.select({
				name: equipmentRentals.name,
				picture: sql<string>`coalesce(json_unquote(json_extract(${equipmentRentals.imageUrls}, '$[0].url')), '')`,
				totalPrice: equipmentRentalsCart.totalPrice,
				quantity: equipmentRentalsCart.quantity,
				cartItemId: equipmentRentalsCart.id,
				cartItemType: sql<string>`'equipment'`,
			})
			.from(equipmentRentalsCart)
			.leftJoin(
				equipmentRentals,
				eq(equipmentRentalsCart.equipmentRentalId, equipmentRentals.id),
			)
			.where(
				and(
					eq(equipmentRentalsCart.userId, userId),
					eq(equipmentRentalsCart.status, "pending"),
				),
			);

		const movieCartItem = this.databaseService.db
			.select({
				name: cinemaMovies.title,
				picture: sql<string>`${cinemaMovies.posterUrl}`,
				totalPrice: moviesTicketCart.totalPrice,
				quantity: moviesTicketCart.ticketQuantity,
				cartItemId: moviesTicketCart.id,
				cartItemType: sql<string>`'movie'`,
			})
			.from(moviesTicketCart)
			.leftJoin(
				cinemaMoviesShowtimes,
				eq(moviesTicketCart.showtimeId, cinemaMoviesShowtimes.id),
			)
			.leftJoin(
				cinemaMovies,
				eq(cinemaMoviesShowtimes.movieId, cinemaMovies.id),
			)
			.where(
				and(
					eq(moviesTicketCart.userId, userId),
					eq(moviesTicketCart.status, "pending"),
				),
			);

		const cartItems = await unionAll(
			studioCartItem,
			vrgameCartItem,
			foodCartItem,
			hotelCartItem,
			equipmentCartItem,
			movieCartItem,
		);

		return cartItems;
	}

	async clearUserCart(userId: string) {
		await this.databaseService.db.transaction(async (tx) => {
			await tx
				.delete(studioSessionCart)
				.where(
					and(
						eq(studioSessionCart.userId, userId),
						eq(studioSessionCart.status, "pending"),
					),
				);

			await tx
				.delete(vrgamesTicketCart)
				.where(
					and(
						eq(vrgamesTicketCart.userId, userId),
						eq(vrgamesTicketCart.status, "pending"),
					),
				);

			await tx
				.delete(foodCart)
				.where(
					and(eq(foodCart.userId, userId), eq(foodCart.status, "pending")),
				);

			await tx
				.delete(hotelCart)
				.where(
					and(eq(hotelCart.userId, userId), eq(hotelCart.status, "pending")),
				);

			await tx
				.delete(equipmentRentalsCart)
				.where(
					and(
						eq(equipmentRentalsCart.userId, userId),
						eq(equipmentRentalsCart.status, "pending"),
					),
				);

			await tx
				.delete(moviesTicketCart)
				.where(
					and(
						eq(moviesTicketCart.userId, userId),
						eq(moviesTicketCart.status, "pending"),
					),
				);
		});
	}

	async decrementServicesAndClearUserCart(userId: string) {
		await this.databaseService.db.transaction(async (tx) => {
			const vrgameCartItems = await tx
				.select()
				.from(vrgamesTicketCart)
				.where(
					and(
						eq(vrgamesTicketCart.userId, userId),
						eq(vrgamesTicketCart.status, "pending"),
					),
				);

			if (vrgameCartItems.length > 0) {
				for (const item of vrgameCartItems) {
					await tx
						.update(vrgames)
						.set({
							ticketQuantity: decrement(
								vrgames.ticketQuantity,
								item.ticketQuantity,
							),
						})
						.where(eq(vrgames.id, item.vrgameId));
				}
			}

			const movieCartItems = await tx
				.select()
				.from(moviesTicketCart)
				.where(
					and(
						eq(moviesTicketCart.userId, userId),
						eq(moviesTicketCart.status, "pending"),
					),
				);

			if (movieCartItems.length > 0) {
				for (const item of movieCartItems) {
					const showtime = await tx
						.select()
						.from(cinemaMoviesShowtimes)
						.where(eq(cinemaMoviesShowtimes.id, item.showtimeId))
						.limit(1);

					if (showtime) {
						await tx
							.update(cinemaMoviesShowtimes)
							.set({
								totalSeats: decrement(
									cinemaMoviesShowtimes.totalSeats,
									item.ticketQuantity,
								),
							})
							.where(eq(cinemaMoviesShowtimes.id, item.showtimeId));
					}
				}
			}

			const foodCartItems = await tx
				.select()
				.from(foodCart)
				.where(
					and(eq(foodCart.userId, userId), eq(foodCart.status, "pending")),
				);

			if (foodCartItems.length > 0) {
				for (const item of foodCartItems) {
					await tx
						.update(foods)
						.set({
							quantity: decrement(foods.quantity, item.quantity),
						})
						.where(eq(foods.id, item.foodId));
				}
			}

			const equipmentCartItems = await tx
				.select()
				.from(equipmentRentalsCart)
				.where(
					and(
						eq(equipmentRentalsCart.userId, userId),
						eq(equipmentRentalsCart.status, "pending"),
					),
				);

			if (equipmentCartItems.length > 0) {
				for (const item of equipmentCartItems) {
					await tx
						.update(equipmentRentals)
						.set({
							quantityAvailable: decrement(
								equipmentRentals.quantityAvailable,
								item.quantity,
							),
						})
						.where(eq(equipmentRentals.id, item.equipmentRentalId));
				}
			}

			// Clear the cart after decrementing
			await this.clearUserCart(userId);
		});
	}

	async getDatabaseConnection() {
		return this.databaseService.db;
	}

	async createPendingOrder(
		orderData: CreateOrder,
		transaction: MysqlDatabaseTransaction,
	) {
		const order = await transaction
			.insert(orders)
			.values(orderData)
			.$returningId();

		return order[0];
	}

	async createHotelBookingsBulk(
		bookingsData: CreateHotelBooking[],
		transaction: MysqlDatabaseTransaction,
	) {
		const bookings = await transaction
			.insert(hotelBookings)
			.values(bookingsData)
			.$returningId();

		return bookings;
	}

	async createFoodOrdersBulk(
		ordersData: CreateFoodOrder[],
		transaction: MysqlDatabaseTransaction,
	) {
		const orders = await transaction
			.insert(foodOrders)
			.values(ordersData)
			.$returningId();

		return orders;
	}

	async createMovieTicketPurchaseRecord(
		purchaseData: CreateMovieTicketPurchase[],
		transaction: MysqlDatabaseTransaction,
	) {
		const purchases = await transaction
			.insert(movieTicketPurchases)
			.values(purchaseData)
			.$returningId();

		return purchases;
	}

	async createVrgameTicketPurchaseRecord(
		purchaseData: CreateVRGameTicketPurchase[],
		transaction: MysqlDatabaseTransaction,
	) {
		const purchases = await transaction
			.insert(vrgameTicketPurchases)
			.values(purchaseData)
			.$returningId();

		return purchases;
	}

	async createEquipmentRentalBookingRecord(
		bookingData: CreateEquipmentRentalBooking[],
		transaction: MysqlDatabaseTransaction,
	) {
		const purchases = await transaction
			.insert(equipmentRentalBookings)
			.values(bookingData)
			.$returningId();

		return purchases;
	}

	async createStudioSessionBookingRecord(
		bookingData: CreateStudioSessionBooking[],
		transaction: MysqlDatabaseTransaction,
	) {
		const bookings = await transaction
			.insert(studioSessionBookings)
			.values(bookingData)
			.$returningId();

		return bookings;
	}

	async getOrderByPaymentReference(paymentReference: string) {
		return await this.databaseService.db.query.orders.findFirst({
			where: eq(orders.paymentReference, paymentReference),
		});
	}

	async updatePendingOrder(
		orderId: string,
		updateData: Partial<Omit<CreateOrder, "id" | "createdAt" | "updatedAt">>,
		transaction: MysqlDatabaseTransaction,
	) {
		await transaction
			.update(orders)
			.set(updateData)
			.where(eq(orders.id, orderId));
	}

	async bulkUpdateVrgameTickets(
		ticketIds: string[],
		updateData: Partial<
			Omit<CreateVRGameTicketPurchase, "id" | "createdAt" | "updatedAt">
		>,
		transaction: MysqlDatabaseTransaction,
	) {
		await transaction
			.update(vrgameTicketPurchases)
			.set(updateData)
			.where(inArray(vrgameTicketPurchases.ticketId, ticketIds));
	}

	async bulkUpdateMovieTickets(
		ticketIds: string[],
		updateData: Partial<
			Omit<CreateMovieTicketPurchase, "id" | "createdAt" | "updatedAt">
		>,
		transaction: MysqlDatabaseTransaction,
	) {
		await transaction
			.update(movieTicketPurchases)
			.set(updateData)
			.where(inArray(movieTicketPurchases.ticketId, ticketIds));
	}

	async bulkUpdateStudioBookings(
		bookingIds: string[],
		updateData: Partial<
			Omit<CreateStudioSessionBooking, "id" | "createdAt" | "updatedAt">
		>,
		transaction: MysqlDatabaseTransaction,
	) {
		await transaction
			.update(studioSessionBookings)
			.set(updateData)
			.where(inArray(studioSessionBookings.id, bookingIds));
	}

	async bulkUpdateEquipmentRentalBookings(
		bookingIds: string[],
		updateData: Partial<
			Omit<CreateEquipmentRentalBooking, "id" | "createdAt" | "updatedAt">
		>,
		transaction: MysqlDatabaseTransaction,
	) {
		await transaction
			.update(equipmentRentalBookings)
			.set(updateData)
			.where(inArray(equipmentRentalBookings.id, bookingIds));
	}

	async bulkUpdateFoodOrders(
		orderIds: string[],
		updateData: Partial<
			Omit<CreateFoodOrder, "id" | "createdAt" | "updatedAt">
		>,
		transaction: MysqlDatabaseTransaction,
	) {
		await transaction
			.update(foodOrders)
			.set(updateData)
			.where(inArray(foodOrders.id, orderIds));
	}

	async bulkUpdateHotelBookings(
		bookingIds: string[],
		updateData: Partial<
			Omit<CreateHotelBooking, "id" | "createdAt" | "updatedAt">
		>,
		transaction: MysqlDatabaseTransaction,
	) {
		await transaction
			.update(hotelBookings)
			.set(updateData)
			.where(inArray(hotelBookings.id, bookingIds));
	}

	async getUserTickets({
		userId,
		offset,
		limit,
	}: { userId: string; limit: number; offset: number }) {
		const movieTickets = this.databaseService.db
			.select({
				ticketId: movieTicketPurchases.ticketId,
				type: sql<string>`'movie'`,
				category: movieTicketPurchases.genre,
				title: movieTicketPurchases.movieName,
				imageUrl: movieTicketPurchases.movieImageUrl,
				ageRating: cinemaMovies.ageRating,
				date: movieTicketPurchases.showDate,
				time: movieTicketPurchases.showtime,
				qrcodeData: movieTicketPurchases.qrcodeData,
			})
			.from(movieTicketPurchases)
			.where(
				and(
					eq(movieTicketPurchases.userId, userId),
					or(
						eq(movieTicketPurchases.status, "completed"),
						eq(movieTicketPurchases.status, "cancelled"),
					),
				),
			)
			.leftJoin(
				cinemaMovies,
				eq(movieTicketPurchases.movieId, cinemaMovies.id),
			);

		const vrgameTickets = this.databaseService.db
			.select({
				ticketId: vrgameTicketPurchases.ticketId,
				type: sql<string>`'vrgame'`,
				category: vrgameTicketPurchases.vrgameCategory,
				title: vrgameTicketPurchases.vrgameName,
				imageUrl: vrgameTicketPurchases.vrgameImageUrl,
				ageRating: vrgames.ageRating,
				date: vrgameTicketPurchases.scheduledDate,
				time: vrgameTicketPurchases.scheduledTime,
				qrcodeData: vrgameTicketPurchases.qrcodeData,
			})
			.from(vrgameTicketPurchases)
			.where(
				and(
					eq(vrgameTicketPurchases.userId, userId),
					or(
						eq(vrgameTicketPurchases.status, "completed"),
						eq(vrgameTicketPurchases.status, "cancelled"),
					),
				),
			)
			.leftJoin(vrgames, eq(vrgameTicketPurchases.vrgameId, vrgames.id));

		const studioTickets = this.databaseService.db
			.select({
				ticketId: studioSessionBookings.id,
				type: sql<string>`'studio'`,
				category: sql<string>`'Studio Session'`,
				title: sql<string>`CONCAT('Studio Session at ', ${studioSessionBookings.studioName})`,
				imageUrl: sql<string>`''`,
				ageRating: sql<number>`0`,
				date: studioSessionBookings.sessionDate,
				time: studioSessionBookings.sessionStartTime,
				qrcodeData: studioSessionBookings.qrcodeData,
			})
			.from(studioSessionBookings)
			.leftJoin(studios, eq(studioSessionBookings.studioId, studios.id))
			.where(
				and(
					eq(studioSessionBookings.userId, userId),
					or(
						eq(studioSessionBookings.status, "completed"),
						eq(studioSessionBookings.status, "scheduled"),
						eq(studioSessionBookings.status, "cancelled"),
					),
				),
			);

		const tickets = await unionAll(movieTickets, vrgameTickets, studioTickets)
			.limit(limit)
			.offset(offset);

		return tickets;
	}

	async getUserTicketDetailsById({
		ticketId,
		userId,
		ticketType,
	}: {
		ticketId: string;
		userId: string;
		ticketType: "movie" | "vrgame" | "studio";
	}) {
		if (ticketType === "movie") {
			return await this.databaseService.db
				.select({
					movieTitle: movieTicketPurchases.movieName,
					movieImageUrl: movieTicketPurchases.movieImageUrl,
					genre: movieTicketPurchases.genre,
					showDate: movieTicketPurchases.showDate,
					showtime: movieTicketPurchases.showtime,
					price: movieTicketPurchases.ticketPrice,
					cinemaName: cinemas.name,
					cinemaHallName: movieTicketPurchases.cinemaHallName,
					cinemaLocation: movieTicketPurchases.location,
					location: movieTicketPurchases.location,
					qrcodeData: movieTicketPurchases.qrcodeData,
				})
				.from(movieTicketPurchases)
				.where(
					and(
						eq(movieTicketPurchases.ticketId, ticketId),
						eq(movieTicketPurchases.userId, userId),
					),
				)
				.leftJoin(
					cinemaHalls,
					eq(movieTicketPurchases.cinemaHallId, cinemaHalls.id),
				)
				.leftJoin(cinemas, eq(cinemaHalls.cinemaId, cinemas.id));
		} else if (ticketType === "vrgame") {
			return await this.databaseService.db
				.select({
					vrgameName: vrgameTicketPurchases.vrgameName,
					vrgameImageUrl: vrgameTicketPurchases.vrgameImageUrl,
					vrgameCategory: vrgameTicketPurchases.vrgameCategory,
					scheduledDate: vrgameTicketPurchases.scheduledDate,
					scheduledTime: vrgameTicketPurchases.scheduledTime,
					price: vrgameTicketPurchases.ticketPrice,
					qrcodeData: vrgameTicketPurchases.qrcodeData,
				})
				.from(vrgameTicketPurchases)
				.where(
					and(
						eq(vrgameTicketPurchases.ticketId, ticketId),
						eq(vrgameTicketPurchases.userId, userId),
					),
				);
		} else if (ticketType === "studio") {
			return await this.databaseService.db
				.select({
					studioName: studioSessionBookings.studioName,
					sessionDate: studioSessionBookings.sessionDate,
					sessionStartTime: studioSessionBookings.sessionStartTime,
					sessionEndTime: studioSessionBookings.sessionEndTime,
					price: studioSessionBookings.totalPrice,
					qrcodeData: studioSessionBookings.qrcodeData,
				})
				.from(studioSessionBookings)
				.where(
					and(
						eq(studioSessionBookings.id, ticketId),
						eq(studioSessionBookings.userId, userId),
					),
				);
		} else {
			return [];
		}
	}

	async getUserReciepts({
		userId,
		limit,
		offset,
	}: { userId: string; limit: number; offset: number }) {
		const studioReceipts = this.databaseService.db
			.select({
				receiptId: studioSessionBookings.id,
				title: studioSessionBookings.studioName,
				type: sql<string>`'studio'`,
				quantity: sql<number>`1`,
				imageUrl: sql<string>`''`,
				receiptBarcodeData: studioSessionBookings.recieptBarcodeData,
			})
			.from(studioSessionBookings)
			.where(
				and(
					eq(studioSessionBookings.userId, userId),
					or(
						eq(studioSessionBookings.status, "completed"),
						eq(studioSessionBookings.status, "scheduled"),
						eq(studioSessionBookings.status, "cancelled"),
					),
				),
			);

		const equipmentRentalReceipts = this.databaseService.db
			.select({
				receiptId: equipmentRentalBookings.id,
				title: sql<string>`${equipmentRentals.name}`,
				type: sql<string>`'equipment'`,
				quantity: equipmentRentalBookings.quantity,
				imageUrl: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${equipmentRentals.imageUrls}, '$[0].url')), '')`,
				receiptBarcodeData: equipmentRentalBookings.receiptBarcodeData,
			})
			.from(equipmentRentalBookings)
			.leftJoin(
				equipmentRentals,
				eq(equipmentRentalBookings.equipmentId, equipmentRentals.id),
			)
			.where(
				and(
					eq(equipmentRentalBookings.userId, userId),
					or(
						eq(equipmentRentalBookings.status, "ongoing"),
						eq(equipmentRentalBookings.status, "completed"),
						eq(equipmentRentalBookings.status, "cancelled"),
					),
				),
			);

		const hotelReceipts = this.databaseService.db
			.select({
				receiptId: hotelBookings.id,
				title: sql<string>`${hotels.name}`,
				type: sql<string>`'hotel'`,
				quantity: sql<number>`1`,
				imageUrl: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${hotelRooms.imageUrls}, '$[0].url')), '')`,
				receiptBarcodeData: hotelBookings.receiptBarcodeData,
			})
			.from(hotelBookings)
			.leftJoin(hotelRooms, eq(hotelBookings.hotelRoomId, hotelRooms.id))
			.leftJoin(hotels, eq(hotelRooms.hotelId, hotels.id))
			.where(
				and(
					eq(hotelBookings.userId, userId),
					or(
						eq(hotelBookings.status, "completed"),
						eq(hotelBookings.status, "cancelled"),
						eq(hotelBookings.status, "confirmed"),
					),
				),
			);

		const foodReceipts = this.databaseService.db
			.select({
				receiptId: foodOrders.id,
				title: sql<string>`${foods.name}`,
				type: sql<string>`'food'`,
				quantity: foodOrders.quantity,
				imageUrl: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${foods.imageUrls}, '$[0].url')), '')`,
				receiptBarcodeData: foodOrders.receiptBarcodeData,
			})
			.from(foodOrders)
			.leftJoin(foods, eq(foodOrders.foodId, foods.id))
			.where(
				and(
					eq(foodOrders.userId, userId),
					or(
						eq(foodOrders.status, "delivered"),
						eq(foodOrders.status, "cancelled"),
					),
				),
			);

		const receipts = await unionAll(
			studioReceipts,
			equipmentRentalReceipts,
			hotelReceipts,
			foodReceipts,
		)
			.limit(limit)
			.offset(offset);

		return receipts;
	}

	async getUserRecieptDetailsById({
		receiptId,
		userId,
		receiptType,
	}: {
		receiptId: string;
		userId: string;
		receiptType: "studio" | "equipment" | "hotel" | "food";
	}) {
		if (receiptType === "studio") {
			return await this.databaseService.db
				.select({
					studioName: studioSessionBookings.studioName,
					sessionDate: studioSessionBookings.sessionDate,
					sessionStartTime: studioSessionBookings.sessionStartTime,
					sessionEndTime: studioSessionBookings.sessionEndTime,
					price: studioSessionBookings.totalPrice,
					receiptBarcodeData: studioSessionBookings.qrcodeData,
				})
				.from(studioSessionBookings)
				.where(
					and(
						eq(studioSessionBookings.id, receiptId),
						eq(studioSessionBookings.userId, userId),
					),
				);
		} else if (receiptType === "equipment") {
			return await this.databaseService.db
				.select({
					equipmentName: equipmentRentals.name,
					rentalStartDate: equipmentRentalBookings.rentalStartDate,
					rentalEndDate: equipmentRentalBookings.rentalEndDate,
					quantity: equipmentRentalBookings.quantity,
					price: equipmentRentalBookings.totalPrice,
					receiptBarcodeData: equipmentRentalBookings.receiptBarcodeData,
				})
				.from(equipmentRentalBookings)
				.leftJoin(
					equipmentRentals,
					eq(equipmentRentalBookings.equipmentId, equipmentRentals.id),
				)
				.where(
					and(
						eq(equipmentRentalBookings.id, receiptId),
						eq(equipmentRentalBookings.userId, userId),
					),
				);
		} else if (receiptType === "hotel") {
			return await this.databaseService.db
				.select({
					hotelName: hotels.name,
					hotelImageUrl: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${hotelRooms.imageUrls}, '$[0].url')), '')`,
					roomName: hotelRooms.name,
					checkInDate: hotelBookings.checkInDate,
					checkOutDate: hotelBookings.checkOutDate,
					price: hotelBookings.totalPrice,
					location: hotels.state,
					receiptBarcodeData: hotelBookings.receiptBarcodeData,
				})
				.from(hotelBookings)
				.leftJoin(hotelRooms, eq(hotelBookings.hotelRoomId, hotelRooms.id))
				.leftJoin(hotels, eq(hotelRooms.hotelId, hotels.id))
				.where(
					and(
						eq(hotelBookings.id, receiptId),
						eq(hotelBookings.userId, userId),
					),
				);
		} else if (receiptType === "food") {
			return await this.databaseService.db
				.select({
					foodName: foods.name,
					quantity: foodOrders.quantity,
					price: foodOrders.totalPrice,
					addons: foodOrders.foodAddons,
					receiptBarcodeData: foodOrders.receiptBarcodeData,
				})
				.from(foodOrders)
				.leftJoin(foods, eq(foodOrders.foodId, foods.id))
				.where(
					and(eq(foodOrders.id, receiptId), eq(foodOrders.userId, userId)),
				);
		} else {
			return [];
		}
	}

	async getUserOrders({
		userId,
		offset,
		limit,
	}: { userId: string; offset: number; limit: number }) {
		const fetchedOrders = await this.databaseService.db.query.orders.findMany({
			where: and(eq(orders.userId, userId), eq(orders.status, "completed")),
			limit,
			offset,
			columns: {
				status: false,
				createdAt: false,
				updatedAt: false,
			},
		});

		return fetchedOrders;
	}
}
