import { Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { CreateUser } from "src/database/schema";
import {
	EquipmentRentalBookingStatus,
	StudioBookingStatus,
} from "../admin/admin.repository";

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async getUserById(id: string) {
		return await this.userRepository.findUserById(id);
	}

	async getUserByEmail(email: string) {
		return await this.userRepository.findUserByEmail(email);
	}

	async createUser(
		userData: Omit<CreateUser, "id" | "createdAt" | "updatedAt">,
	) {
		return await this.userRepository.createUser(userData);
	}

	async updateUser(
		id: string,
		updateData: Partial<Omit<CreateUser, " id" | "createdAt" | "updatedAt">>,
	) {
		return await this.userRepository.updateUser(id, updateData);
	}

	async getUserStudioBookings({
		userId,
		page,
		limit,
		status,
	}: {
		userId: string;
		page: number;
		limit: number;
		status?: StudioBookingStatus;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		return await this.userRepository.getUserStudioBookings({
			userId,
			offset,
			limit,
			status,
		});
	}

	async getUserEquipmentRentalBookings({
		userId,
		page,
		limit = 10,
		status,
	}: {
		userId: string;
		page: number;
		limit: number;
		status?: EquipmentRentalBookingStatus;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		return await this.userRepository.getUserEquipmentRentalBookings({
			userId,
			offset,
			limit,
			status,
		});
	}

	async getUserVrgamesTicketPurchases({
		userId,
		page,
		limit = 10,
		status,
	}: {
		userId: string;
		page: number;
		limit: number;
		status?: "pending" | "completed" | "canceled";
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		return await this.userRepository.getUserVrgamesTicketPurchases({
			userId,
			offset,
			limit,
			status,
		});
	}

	async getUserMovieTicketPurchases({
		userId,
		page,
		limit = 10,
		status,
	}: {
		userId: string;
		page: number;
		limit: number;
		status?: "pending" | "completed" | "canceled";
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		return await this.userRepository.getUserMovieTicketPurchases({
			userId,
			offset,
			limit,
			status,
		});
	}

	async getUserHotelBookings({
		userId,
		page,
		limit = 10,
		status,
	}: {
		userId: string;
		page: number;
		limit: number;
		status?: "pending" | "confirmed" | "cancelled" | "completed";
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		return await this.userRepository.getUserHotelBookings({
			userId,
			offset,
			limit,
			status,
		});
	}

	async getUserFoodOrders({
		userId,
		page,
		limit = 10,
		status,
	}: {
		userId: string;
		page: number;
		limit: number;
		status?: "pending" | "preparing" | "delivered" | "cancelled";
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		return await this.userRepository.getUserFoodOrders({
			userId,
			offset,
			limit,
			status,
		});
	}
}
