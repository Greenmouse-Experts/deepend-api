import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "src/database/database.service";
import {
	// AddToCartType,
	// cartItems,
	// carts,
	CreateUser,
	users,
} from "src/database/schema";
import {
	EquipmentRentalBookingStatus,
	StudioBookingStatus,
} from "../admin/admin.repository";

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
					snacks: {
						columns: {
							id: true,
							createdAt: false,
						},
					},
				},
			});

		return purchases;
	}

	// async getUserExistingCart(userId: string) {
	// 	const cart = await this.databaseService.db.query.carts.findFirst({
	// 		where: (table, { and }) =>
	// 			and(eq(table.userId, userId), eq(table.status, "active")),
	// 		with: {
	// 			items: {
	// 				with: {
	// 					addons: true,
	// 				},
	// 			},
	// 		},
	// 	});
	//
	// 	return cart;
	// }
	//
	// async createCart(userId: string) {
	// 	const newCart = await this.databaseService.db
	// 		.insert(carts)
	// 		.values({ userId, status: "active" })
	// 		.$returningId();
	//
	// 	return newCart.pop();
	// }
	//
	// async updateCartStatus(
	// 	cartId: string,
	// 	status: "active" | "checked_out" | "abandoned",
	// ) {
	// 	await this.databaseService.db
	// 		.update(carts)
	// 		.set({ status })
	// 		.where(eq(carts.id, cartId));
	// }
	//
	// async addToCart(cartItemData: AddToCartType) {
	// 	const newItem = await this.databaseService.db
	// 		.insert(cartItems)
	// 		.values(cartItemData)
	// 		.$returningId();
	//
	// 	return newItem;
	// }
	//
	// async clearUserCart(userId: string) {
	// 	const userCart = await this.getUserExistingCart(userId);
	//
	// 	if (userCart) {
	// 		await this.databaseService.db
	// 			.delete(cartItems)
	// 			.where(eq(cartItems.cartId, userCart.id));
	// 		await this.databaseService.db
	// 			.delete(carts)
	// 			.where(eq(carts.id, userCart.id));
	// 	}
	// }
	//
	// async removeCartItem(cartItemId: string) {
	// 	await this.databaseService.db
	// 		.delete(cartItems)
	// 		.where(eq(cartItems.id, cartItemId));
	// }
}
