import { Injectable } from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";
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
} from "src/database/schema";
import {
	EquipmentRentalBookingStatus,
	StudioBookingStatus,
} from "../admin/admin.repository";
import { unionAll } from "drizzle-orm/mysql-core";

@Injectable()
export class UserRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async findUserById(id: string) {
		return await this.databaseService.db.query.users.findFirst({
			where: eq(users.id, id),
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
		status?: "pending" | "completed" | "canceled";
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
		status?: "pending" | "completed" | "canceled";
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
							movieId: false,
							cinemaHallId: false,
							showDate: false,
							showtime: false,
							totalSeats: false,
							ticketPrice: false,
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
}
