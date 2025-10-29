import { Injectable } from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";
import { DatabaseService } from "src/database/database.service";
import {
	// AddToCartType,
	// cartItems,
	// carts,
	CreateUser,
	foodOrders,
	studioBookings,
	equipmentRentalsBookings,
	users,
	vrgamesTicketPurchases,
	moviesTicketPurchases,
	hotelBookings,
	studios,
	vrgames,
	foods,
	hotelRooms,
	equipmentRentals,
	cinemaMoviesShowtimes,
	cinemaMovies,
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
			await this.databaseService.db.query.studioBookings.findMany({
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
			await this.databaseService.db.query.studioBookings.findFirst({
				where: (table, { and }) =>
					and(eq(table.id, bookingId), eq(table.userId, userId)),
				with: {
					studio: true,
				},
			});

		return booking;
	}

	async deleteUserStudioBookingById(bookingId: string, userId: string) {
		await this.databaseService.db
			.delete(equipmentRentalsBookings)
			.where(
				and(
					eq(equipmentRentalsBookings.id, bookingId),
					eq(equipmentRentalsBookings.userId, userId),
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
			await this.databaseService.db.query.equipmentRentalsBookings.findMany({
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
			await this.databaseService.db.query.equipmentRentalsBookings.findFirst({
				where: (table, { and }) =>
					and(eq(table.id, bookingId), eq(table.userId, userId)),
			});

		return booking;
	}

	async deleteUserEquipmentRentalBookingById(
		bookingId: string,
		userId: string,
	) {
		await this.databaseService.db
			.delete(equipmentRentalsBookings)
			.where(
				and(
					eq(equipmentRentalsBookings.id, bookingId),
					eq(equipmentRentalsBookings.userId, userId),
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
			await this.databaseService.db.query.vrgamesTicketPurchases.findMany({
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
			await this.databaseService.db.query.vrgamesTicketPurchases.findFirst({
				where: (table, { and }) =>
					and(eq(table.id, purchaseId), eq(table.userId, userId)),
			});

		return purchase;
	}

	async deleteUserVrgamesTicketPurchaseById(
		purchaseId: string,
		userId: string,
	) {
		await this.databaseService.db
			.delete(vrgamesTicketPurchases)
			.where(
				and(
					eq(vrgamesTicketPurchases.id, purchaseId),
					eq(vrgamesTicketPurchases.userId, userId),
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
			await this.databaseService.db.query.moviesTicketPurchases.findMany({
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
			await this.databaseService.db.query.moviesTicketPurchases.findFirst({
				where: (table, { and }) =>
					and(eq(table.id, purchaseId), eq(table.userId, userId)),
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
		await this.databaseService.db
			.delete(moviesTicketPurchases)
			.where(
				and(
					eq(moviesTicketPurchases.id, purchaseId),
					eq(moviesTicketPurchases.userId, userId),
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
		const bookings = await this.databaseService.db.query.hotelBookings.findMany(
			{
				where: (table, { and }) =>
					and(
						eq(table.userId, userId),
						status ? eq(table.status, status) : undefined,
					),
				limit,
				offset,
			},
		);

		return bookings;
	}

	async getUserHotelBookingById(bookingId: string, userId: string) {
		const booking = await this.databaseService.db.query.hotelBookings.findFirst(
			{
				where: (table, { and }) =>
					and(eq(table.id, bookingId), eq(table.userId, userId)),
			},
		);

		return booking;
	}

	async deleteUserHotelBookingById(bookingId: string, userId: string) {
		await this.databaseService.db
			.delete(hotelBookings)
			.where(
				and(
					eq(equipmentRentalsBookings.id, bookingId),
					eq(equipmentRentalsBookings.userId, userId),
				),
			);
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
		const orders = await this.databaseService.db.query.foodOrders.findMany({
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
						foodOrderId: false,
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
		const order = await this.databaseService.db.query.foodOrders.findFirst({
			where: (table, { and }) =>
				and(eq(table.id, orderId), eq(table.userId, userId)),
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
						foodOrderId: false,
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
			.delete(foodOrders)
			.where(and(eq(foodOrders.id, orderId), eq(foodOrders.userId, userId)));
	}

	async getUserCartContents(userId: string) {
		const studioCartItem = this.databaseService.db
			.select({
				name: studios.name,
				picture: sql<string>`''`,
				totalPrice: studioBookings.totalPrice,
				quantity: sql<number>`1`,
				cartItemId: studioBookings.id,
				cartItemType: sql<string>`'studio'`,
			})
			.from(studioBookings)
			.leftJoin(studios, eq(studioBookings.studioId, studios.id))
			.where(
				and(
					eq(studioBookings.userId, userId),
					eq(studioBookings.status, "pending"),
				),
			);

		const vrgameCartItem = this.databaseService.db
			.select({
				name: vrgames.name,
				picture: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${vrgames.imageUrls}, '$[0].url')), '')`,
				totalPrice: vrgamesTicketPurchases.totalPrice,
				quantity: vrgamesTicketPurchases.ticketQuantity,
				cartItemId: vrgamesTicketPurchases.id,
				cartItemType: sql<string>`'vrgame'`,
			})
			.from(vrgamesTicketPurchases)
			.leftJoin(vrgames, eq(vrgamesTicketPurchases.vrgameId, vrgames.id))
			.where(
				and(
					eq(vrgamesTicketPurchases.userId, userId),
					eq(vrgamesTicketPurchases.status, "pending"),
				),
			);

		const foodCartItem = this.databaseService.db
			.select({
				name: foods.name,
				picture: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${foods.imageUrls}, '$[0].url')), '')`,
				totalPrice: foodOrders.totalPrice,
				quantity: foodOrders.quantity,
				cartItemId: foodOrders.id,
				cartItemType: sql<string>`'food'`,
			})
			.from(foodOrders)
			.leftJoin(foods, eq(foodOrders.foodId, foods.id))
			.where(
				and(eq(foodOrders.userId, userId), eq(foodOrders.status, "pending")),
			);

		const hotelCartItem = this.databaseService.db
			.select({
				name: hotelRooms.name,
				picture: sql<string>`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${hotelRooms.imageUrls}, '$[0].url')), '')`,
				totalPrice: hotelBookings.totalPrice,
				quantity: sql<number>`1`,
				cartItemId: hotelBookings.id,
				cartItemType: sql<string>`'hotel'`,
			})
			.from(hotelBookings)
			.leftJoin(hotelRooms, eq(hotelBookings.hotelRoomId, hotelRooms.id))
			.where(
				and(
					eq(hotelBookings.userId, userId),
					eq(hotelBookings.status, "pending"),
				),
			);

		const equipmentCartItem = this.databaseService.db
			.select({
				name: equipmentRentals.name,
				picture: sql<string>`coalesce(json_unquote(json_extract(${equipmentRentals.imageUrls}, '$[0].url')), '')`,
				totalPrice: equipmentRentalsBookings.totalPrice,
				quantity: sql<number>`1`,
				cartItemId: equipmentRentalsBookings.id,
				cartItemType: sql<string>`'equipment'`,
			})
			.from(equipmentRentalsBookings)
			.leftJoin(
				equipmentRentals,
				eq(equipmentRentalsBookings.equipmentRentalId, equipmentRentals.id),
			)
			.where(
				and(
					eq(equipmentRentalsBookings.userId, userId),
					eq(equipmentRentalsBookings.status, "pending"),
				),
			);

		const movieCartItem = this.databaseService.db
			.select({
				name: cinemaMovies.title,
				picture: sql<string>`${cinemaMovies.posterUrl}`,
				totalPrice: moviesTicketPurchases.totalPrice,
				quantity: moviesTicketPurchases.ticketQuantity,
				cartItemId: moviesTicketPurchases.id,
				cartItemType: sql<string>`'movie'`,
			})
			.from(moviesTicketPurchases)
			.leftJoin(
				cinemaMoviesShowtimes,
				eq(moviesTicketPurchases.showtimeId, cinemaMoviesShowtimes.id),
			)
			.leftJoin(
				cinemaMovies,
				eq(cinemaMoviesShowtimes.movieId, cinemaMovies.id),
			)
			.where(
				and(
					eq(moviesTicketPurchases.userId, userId),
					eq(moviesTicketPurchases.status, "pending"),
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
				.delete(studioBookings)
				.where(
					and(
						eq(studioBookings.userId, userId),
						eq(studioBookings.status, "pending"),
					),
				);

			await tx
				.delete(vrgamesTicketPurchases)
				.where(
					and(
						eq(vrgamesTicketPurchases.userId, userId),
						eq(vrgamesTicketPurchases.status, "pending"),
					),
				);

			await tx
				.delete(foodOrders)
				.where(
					and(eq(foodOrders.userId, userId), eq(foodOrders.status, "pending")),
				);

			await tx
				.delete(hotelBookings)
				.where(
					and(
						eq(hotelBookings.userId, userId),
						eq(hotelBookings.status, "pending"),
					),
				);

			await tx
				.delete(equipmentRentalsBookings)
				.where(
					and(
						eq(equipmentRentalsBookings.userId, userId),
						eq(equipmentRentalsBookings.status, "pending"),
					),
				);

			await tx
				.delete(moviesTicketPurchases)
				.where(
					and(
						eq(moviesTicketPurchases.userId, userId),
						eq(moviesTicketPurchases.status, "pending"),
					),
				);
		});
	}
}
