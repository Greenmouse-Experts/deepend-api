import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { CreateUser } from "src/database/schema";
import {
	EquipmentRentalBookingStatus,
	StudioBookingStatus,
} from "../admin/admin.repository";
import { ServicesService } from "../services/services.service";

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		@Inject(forwardRef(() => ServicesService))
		private readonly servicesService: ServicesService,
	) {}

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

	async getUserCart(userId: string) {
		let cartItems = await this.userRepository.getUserCartContents(userId);

		for (const item of cartItems) {
			switch (item.cartItemType) {
				case "studio":
					const studioPrice =
						(
							await this.servicesService.getStudioSessionTotalPriceById(
								item.cartItemId,
								userId,
							)
						).totalPrice || 0;
					item.totalPrice = String(studioPrice);
					break;
				case "equipment":
					const equipmentPrice =
						(
							await this.servicesService.getEquipmentRentalTotalPriceById(
								item.cartItemId,
								userId,
							)
						).totalPrice || 0;

					item.totalPrice = String(equipmentPrice);
					break;
				case "vrgame":
					const vrgamePrice =
						(
							await this.servicesService.getVrgameSessionTotalPriceById(
								item.cartItemId,
								userId,
							)
						).totalPrice || 0;

					item.totalPrice = String(vrgamePrice);
					break;
				case "movie":
					const moviePrice =
						(
							await this.servicesService.getMovieShowtimeTotalPriceById(
								item.cartItemId,
								userId,
							)
						).totalPrice || 0;

					item.totalPrice = String(moviePrice);
					break;
				case "hotel":
					const hotelPrice =
						(
							await this.servicesService.getHotelBookingTotalPriceById(
								item.cartItemId,
								userId,
							)
						).totalPrice || 0;

					item.totalPrice = String(hotelPrice);
					break;
				case "food":
					const foodPrice =
						(
							await this.servicesService.getFoodOrderTotalPriceById(
								item.cartItemId,
								userId,
							)
						).totalPrice || 0;

					item.totalPrice = String(foodPrice);
					break;
				default:
					throw new BadRequestException("Invalid item type in cart");
			}
		}

		return cartItems;
	}

	async getCartItemDetails({
		userId,
		itemId,
		itemType,
	}: {
		userId: string;
		itemId: string;
		itemType: "studio" | "equipment" | "vrgame" | "movie" | "hotel" | "food";
	}) {
		switch (itemType) {
			case "studio":
				return await this.userRepository.getUserStudioBookingById(
					itemId,
					userId,
				);
			case "equipment":
				return await this.userRepository.getUserEquipmentRentalBookingById(
					itemId,
					userId,
				);
			case "vrgame":
				return await this.userRepository.getUserVrgamesTicketPurchaseById(
					itemId,
					userId,
				);
			case "movie":
				return await this.userRepository.getUserMovieTicketPurchaseById(
					itemId,
					userId,
				);
			case "hotel":
				return await this.userRepository.getUserHotelBookingById(
					itemId,
					userId,
				);
			case "food":
				return await this.userRepository.getUserFoodOrderById(itemId, userId);
			default:
				throw new BadRequestException("Invalid item type");
		}
	}

	async removeCartItem({
		userId,
		itemId,
		itemType,
	}: {
		userId: string;
		itemId: string;
		itemType: "studio" | "equipment" | "vrgame" | "movie" | "hotel" | "food";
	}) {
		switch (itemType) {
			case "studio":
				return await this.userRepository.deleteUserStudioBookingById(
					itemId,
					userId,
				);
			case "equipment":
				return await this.userRepository.deleteUserEquipmentRentalBookingById(
					itemId,
					userId,
				);
			case "vrgame":
				return await this.userRepository.deleteUserVrgamesTicketPurchaseById(
					itemId,
					userId,
				);
			case "movie":
				return await this.userRepository.deleteUserMovieTicketPurchaseById(
					itemId,
					userId,
				);
			case "hotel":
				return await this.userRepository.deleteUserHotelBookingById(
					itemId,
					userId,
				);
			case "food":
				return await this.userRepository.deleteUserFoodOrderById(
					itemId,
					userId,
				);
			default:
				throw new BadRequestException("Invalid item type");
		}
	}

	async clearUserCart(userId: string) {
		return await this.userRepository.clearUserCart(userId);
	}
}
