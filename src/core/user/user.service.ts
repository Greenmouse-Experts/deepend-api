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
import { PaymentService } from "../payment/payment.service";
import {
	CreateEquipmentRentalBooking,
	CreateFoodOrder,
	CreateHotelBooking,
	CreateMovieTicketPurchase,
	CreateOrder,
	CreateStudioSessionBooking,
	CreateVRGameTicketPurchase,
} from "src/database/schema/payment";
import Decimal from "decimal.js";
import { MysqlDatabaseTransaction } from "src/common/helpers";
import { getDistanceInKm } from "src/common/geospatial";

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		@Inject(forwardRef(() => ServicesService))
		private readonly servicesService: ServicesService,
		private readonly paymentService: PaymentService,
	) {}

	async getUserById(id: string) {
		return await this.userRepository.findUserById(id);
	}

	async getUserByEmail(email: string) {
		return await this.userRepository.findUserByEmail(email);
	}

	async getUserEmailByUserId(userId: string) {
		return await this.userRepository.findUserEmailByUserId(userId);
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
		status?: "pending" | "completed" | "cancelled";
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
		status?: "pending" | "completed" | "cancelled";
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
		status?:
			| "pending"
			| "preparing"
			| "delivered"
			| "cancelled"
			| "confirmed"
			| "on-the-way";
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

	async getUserCartItemDetails({
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

	async updateUserCartItemQuantity({
		userId,
		itemId,
		itemType,
		quantity,
	}: {
		userId: string;
		itemId: string;
		itemType: "vrgame" | "movie" | "food" | "equipment";
		quantity: number;
	}) {
		const result = await this.servicesService.updateUserCartItemQuantity({
			userId,
			cartItemId: itemId,
			cartItemType: itemType,
			quantity,
		});

		if (result.affectedRows === 0) {
			throw new BadRequestException(
				"Cart item not found or quantity unchanged",
			);
		}

		return {
			message: "Cart item quantity updated successfully",
		};
	}

	async removeUserCartItem({
		userId,
		itemId,
		itemType,
	}: {
		userId: string;
		itemId: string;
		itemType: "studio" | "equipment" | "vrgame" | "movie" | "hotel" | "food";
	}) {
		let result;
		switch (itemType) {
			case "studio":
				[result] = await this.userRepository.deleteUserStudioBookingById(
					itemId,
					userId,
				);

				if (result.affectedRows === 0) {
					throw new BadRequestException("Studio booking not found in cart");
				}

				return result;
			case "equipment":
				[result] =
					await this.userRepository.deleteUserEquipmentRentalBookingById(
						itemId,
						userId,
					);

				if (result.affectedRows === 0) {
					throw new BadRequestException(
						"Equipment rental booking not found in cart",
					);
				}

				return result;
			case "vrgame":
				[result] =
					await this.userRepository.deleteUserVrgamesTicketPurchaseById(
						itemId,
						userId,
					);

				if (result.affectedRows === 0) {
					throw new BadRequestException(
						"VR game ticket purchase not found in cart",
					);
				}

				return result;
			case "movie":
				[result] = await this.userRepository.deleteUserMovieTicketPurchaseById(
					itemId,
					userId,
				);

				if (result.affectedRows === 0) {
					throw new BadRequestException(
						"Movie ticket purchase not found in cart",
					);
				}

				return result;
			case "hotel":
				[result] = await this.userRepository.deleteUserHotelBookingById(
					itemId,
					userId,
				);

				if (result.affectedRows === 0) {
					throw new BadRequestException("Hotel booking not found in cart");
				}

				return result;
			case "food":
				[result] = await this.userRepository.deleteUserFoodOrderById(
					itemId,
					userId,
				);

				if (result.affectedRows === 0) {
					throw new BadRequestException("Food order not found in cart");
				}

				return result;
			default:
				throw new BadRequestException("Invalid item type");
		}
	}

	async clearUserCart(userId: string) {
		return await this.userRepository.clearUserCart(userId);
	}

	async getUserStudioBookingById(bookingId: string, userId: string) {
		return await this.userRepository.getUserStudioBookingById(
			bookingId,
			userId,
		);
	}

	async getUserEquipmentRentalBookingById(bookingId: string, userId: string) {
		return await this.userRepository.getUserEquipmentRentalBookingById(
			bookingId,
			userId,
		);
	}

	async getUserVrgamesTicketPurchaseById(purchaseId: string, userId: string) {
		return await this.userRepository.getUserVrgamesTicketPurchaseById(
			purchaseId,
			userId,
		);
	}

	async getUserMovieTicketPurchaseById(purchaseId: string, userId: string) {
		return await this.userRepository.getUserMovieTicketPurchaseById(
			purchaseId,
			userId,
		);
	}

	async getUserHotelBookingById(bookingId: string, userId: string) {
		return await this.userRepository.getUserHotelBookingById(bookingId, userId);
	}

	async getUserFoodOrderById(orderId: string, userId: string) {
		return await this.userRepository.getUserFoodOrderById(orderId, userId);
	}

	async getDatabaseConnection() {
		return await this.userRepository.getDatabaseConnection();
	}

	async checkoutUserCart(userId: string) {
		const email = (await this.getUserEmailByUserId(userId))?.email;

		if (!email) {
			throw new BadRequestException("User email not found");
		}

		const cartItems = await this.getUserCart(userId);

		if (cartItems.length === 0) {
			throw new BadRequestException("User cart is empty");
		}

		const database = await this.userRepository.getDatabaseConnection();

		const order = await database.transaction(async (tx) => {
			const paymentReference =
				await this.paymentService.generatePaymentReference();

			const deliverySettings =
				await this.paymentService.getDeliveryFeeSettings(tx);

			const foodOrderCoordinates = await this.userRepository.getUserFoodOrders({
				userId,
				offset: 0,
				limit: 1,
				status: "pending",
			});

			if (!deliverySettings) {
				throw new BadRequestException(
					"Delivery settings not configured, please contact support",
				);
			}

			if (!deliverySettings?.originLat || !deliverySettings?.originLng) {
				throw new BadRequestException(
					"Delivery origin coordinates not configured, please contact support",
				);
			}

			const hasDeliveryFoodOrders = foodOrderCoordinates.some(
				(order) => order.deliveryType === "delivery",
			);

			const foodDeliveryOrder = foodOrderCoordinates.find(
				(order) => order.deliveryType === "delivery",
			);

			if (hasDeliveryFoodOrders && !foodDeliveryOrder?.deliveryAddress) {
				throw new BadRequestException("Food order delivery address not found");
			}

			if (
				hasDeliveryFoodOrders &&
				(!foodDeliveryOrder?.deliveryLat || !foodDeliveryOrder?.deliveryLng)
			) {
				throw new BadRequestException(
					"Food order delivery coordinates not found",
				);
			}

			let distance = 0;

			let deliveryFee = new Decimal(0);
			if (hasDeliveryFoodOrders) {
				distance = getDistanceInKm(
					Number(deliverySettings?.originLat),
					Number(deliverySettings?.originLng),
					Number(foodOrderCoordinates[0]?.deliveryLat),
					Number(foodOrderCoordinates[0]?.deliveryLng),
				);

				deliveryFee = new Decimal(deliverySettings.pricePerKm)
					.mul(new Decimal(distance))
					.toNearest(0.01);
			}

			const taxAmount = new Decimal(0);

			const subtotalAmount = cartItems.reduce(
				(sum, item) =>
					new Decimal(sum)
						.plus(new Decimal(item.totalPrice || 0))
						.toNearest(0.01),
				new Decimal(0),
			);

			const totalAmount = subtotalAmount
				.plus(deliveryFee)
				.plus(taxAmount)
				.toNearest(0.01);

			const createdOrder = await this.userRepository.createPendingOrder(
				{
					userId,
					paymentMethod: "paystack",
					deliveryFee: deliveryFee.toString(),
					taxAmount: "0",
					subtotalAmount: subtotalAmount.toString(),
					totalAmount: totalAmount.toString(),
					currency: "NGN",
					paymentReference,
				},
				tx,
			);

			let studioBookings: CreateStudioSessionBooking[] = [];
			let foodOrderItems: CreateFoodOrder[] = [];
			let equipmentRentals: CreateEquipmentRentalBooking[] = [];
			let vrgameTicketPurchases: CreateVRGameTicketPurchase[] = [];
			let movieTicketPurchases: CreateMovieTicketPurchase[] = [];
			let hotelBookings: CreateHotelBooking[] = [];

			let orderDetails: {
				type: "studio" | "food" | "equipment" | "vrgame" | "movie" | "hotel";
				ticketId: string | null;
				userId: string;
				itemId: string;
				orderId: string;
			}[] = [];

			for (const item of cartItems) {
				switch (item.cartItemType) {
					case "studio":
						const studioSession =
							await this.servicesService.validateStudioSession(
								item.cartItemId,
								userId,
							);

						if (!studioSession) {
							throw new BadRequestException("Invalid studio session in cart");
						}

						studioBookings.push({
							userId,
							orderId: createdOrder.id,
							studioId: studioSession.studioId,
							studioName: studioSession.studio.name,
							sessionPricePerHour: studioSession.studio.hourlyRate,
							sessionDate: studioSession.bookingDate,
							sessionStartTime: studioSession.startTime,
							sessionEndTime: studioSession.endTime,
							totalPrice: String(studioSession.totalPrice),
						});

						break;
					case "food":
						const foodOrder = await this.servicesService.validateFoodOrder(
							item.cartItemId,
							userId,
						);

						if (!foodOrder) {
							throw new BadRequestException("Invalid food order in cart");
						}

						foodOrderItems.push({
							userId,
							orderId: createdOrder.id,
							foodId: foodOrder.foodId,
							foodName: foodOrder.food.name,
							foodImageUrl: foodOrder.food.imageUrls[0].url,
							foodPrice: String(foodOrder.food.price),
							quantity: foodOrder.quantity,
							deliveryAddress: foodOrder.deliveryAddress,
							deliveryLng: foodOrder.deliveryLng,
							deliveryLat: foodOrder.deliveryLat,
							deliveryType: foodOrder.deliveryType,
							totalPrice: String(foodOrder.totalPrice),
							foodAddons:
								foodOrder.foodAddons.map((addon) => ({
									addonId: addon.id,
									addonName: addon.name,
									addonPrice: String(addon.price),
								})) || [],
							specialInstructions: foodOrder.specialInstructions,
						});
						break;
					case "equipment":
						const equipmentRental =
							await this.servicesService.validateEquipmentRental(
								item.cartItemId,
								userId,
							);

						if (!equipmentRental) {
							throw new BadRequestException(
								"Invalid equipment rental booking in cart",
							);
						}

						equipmentRentals.push({
							userId,
							orderId: createdOrder.id,
							equipmentId: equipmentRental.equipmentRentalId as string,
							equipmentName: equipmentRental.equipmentRental?.name as string,
							equipmentImageUrl: equipmentRental.equipmentRental?.imageUrls[0]
								.url as string,
							rentalPricePerDay: equipmentRental.equipmentRental
								?.rentalPricePerDay as string,
							rentalStartDate: equipmentRental.rentalStartDate,
							rentalEndDate: equipmentRental.rentalEndDate,
							quantity: equipmentRental.quantity,
							address: equipmentRental.equipmentRental?.address as string,
							totalPrice: String(equipmentRental.totalPrice),
						});
						break;
					case "vrgame":
						const vrgameOrder =
							await this.servicesService.validateVrgameTicketOrder(
								item.cartItemId,
								userId,
							);

						if (!vrgameOrder) {
							throw new BadRequestException(
								"Invalid VR game ticket purchase in cart",
							);
						}

						vrgameTicketPurchases.push({
							userId,
							orderId: createdOrder.id,
							vrgameId: vrgameOrder.vrgameId as string,
							vrgameName: vrgameOrder.vrgame?.name as string,
							vrgameImageUrl: vrgameOrder.vrgame?.imageUrls[0].url as string,
							vrgameCategory: vrgameOrder.vrgame.category.name as string,
							ticketPrice: vrgameOrder.vrgame?.ticketPrice as string,
							scheduledDate: vrgameOrder.scheduledDate,
							scheduledTime: vrgameOrder.scheduledTime,
							ticketQuantity: vrgameOrder.ticketQuantity,
							totalPrice: String(vrgameOrder.totalPrice),
						});
						break;
					case "movie":
						const movieOrder =
							await this.servicesService.validateMovieTicketOrder(
								item.cartItemId,
								userId,
							);

						if (!movieOrder) {
							throw new BadRequestException(
								"Invalid movie ticket purchase in cart",
							);
						}

						movieTicketPurchases.push({
							userId,
							orderId: createdOrder.id,
							movieId: movieOrder.showtime.movie.id,
							movieName: movieOrder.showtime.movie.title,
							movieImageUrl: movieOrder.showtime.movie.posterUrl as string,
							cinemaHallId: movieOrder.showtime.cinemaHallId,
							cinemaHallName: movieOrder.showtime.cinemaHall.name,
							location: `${movieOrder.showtime.cinemaHall.cinema.address}, ${movieOrder.showtime.cinemaHall.cinema.city}, ${movieOrder.showtime.cinemaHall.cinema.state}`,
							genre: movieOrder.showtime.movie.genres
								.map((g) => g.genre.name)
								.join(", "),
							showDate: movieOrder.showtime.showDate,
							showtime: movieOrder.showtime.showtime,
							ticketPrice: movieOrder.showtime.ticketPrice,
							ticketQuantity: movieOrder.ticketQuantity,
							snackAddOns: movieOrder.orderedSnacks.map((snack) => ({
								snackId: snack.snack.id,
								snackName: snack.snack.name,
								snackQuantity: snack.quantity,
								snackPrice: String(snack.snack.price),
							})),
							totalPrice: String(movieOrder.totalPrice),
						});
						break;
					case "hotel":
						const hotelBooking =
							await this.servicesService.validateHotelBooking(
								item.cartItemId,
								userId,
							);

						if (!hotelBooking) {
							throw new BadRequestException("Invalid hotel booking in cart");
						}

						hotelBookings.push({
							userId,
							orderId: createdOrder.id,
							hotelId: hotelBooking.hotelId as string,
							hotelName: hotelBooking.hotel?.name as string,
							hotelImageUrl: hotelBooking.hotel?.imageUrls[0].url as string,
							hotelRoomId: hotelBooking.hotelRoom.id,
							hotelRoomName: hotelBooking.hotelRoom.name as string,
							hotelRoomPricePerNight: String(
								hotelBooking.hotelRoom.pricePerNight,
							),
							checkInDate: hotelBooking.checkInDate,
							checkOutDate: hotelBooking.checkOutDate,
							totalPrice: String(hotelBooking.totalPrice),
						});

						break;
					default:
						throw new BadRequestException("Invalid item type in cart");
				}

				if (studioBookings.length > 0) {
					const createdStudioSessionBookingRecords =
						await this.userRepository.createStudioSessionBookingRecord(
							studioBookings,
							tx,
						);

					createdStudioSessionBookingRecords.forEach((booking) => {
						orderDetails.push({
							type: "studio",
							ticketId: null,
							userId: userId,
							itemId: booking.id,
							orderId: createdOrder.id,
						});
					});
				}

				if (foodOrderItems.length > 0) {
					const createdFoodOrders =
						await this.userRepository.createFoodOrdersBulk(foodOrderItems, tx);

					createdFoodOrders.forEach((order) => {
						orderDetails.push({
							type: "food",
							ticketId: null,
							userId: userId,
							itemId: order.id,
							orderId: createdOrder.id,
						});
					});
				}

				if (equipmentRentals.length > 0) {
					const equipmentRentalBookings =
						await this.userRepository.createEquipmentRentalBookingRecord(
							equipmentRentals,
							tx,
						);

					equipmentRentalBookings.forEach((booking) => {
						orderDetails.push({
							type: "equipment",
							ticketId: null,
							userId: userId,
							itemId: booking.id,
							orderId: createdOrder.id,
						});
					});
				}

				if (vrgameTicketPurchases.length > 0) {
					const vrgameTickets =
						await this.userRepository.createVrgameTicketPurchaseRecord(
							vrgameTicketPurchases,
							tx,
						);

					vrgameTickets.forEach((ticket) => {
						orderDetails.push({
							type: "vrgame",
							ticketId: ticket.ticketId,
							userId: userId,
							itemId: ticket.ticketId,
							orderId: createdOrder.id,
						});
					});
				}

				if (movieTicketPurchases.length > 0) {
					const movieTickets =
						await this.userRepository.createMovieTicketPurchaseRecord(
							movieTicketPurchases,
							tx,
						);

					movieTickets.forEach((ticket) => {
						orderDetails.push({
							type: "movie",
							ticketId: ticket.ticketId,
							userId: userId,
							itemId: ticket.ticketId,
							orderId: createdOrder.id,
						});
					});
				}

				if (hotelBookings.length > 0) {
					const hotelBookingRecords =
						await this.userRepository.createHotelBookingsBulk(
							hotelBookings,
							tx,
						);

					hotelBookingRecords.forEach((booking) => {
						orderDetails.push({
							type: "hotel",
							ticketId: null,
							userId: userId,
							itemId: booking.id,
							orderId: createdOrder.id,
						});
					});
				}

				await this.userRepository.updatePendingOrder(
					createdOrder.id,
					{ orderDetails },
					tx,
				);
			}

			return {
				amount: totalAmount.toString(),
				subtotalAmount,
				deliveryFee,
				taxAmount,
				paymentReference,
			};
		});

		const intializePayment = await this.paymentService.initializePayment({
			email,
			amount: new Decimal(order.amount).mul(100).toNumber(),
			reference: order.paymentReference,
		});

		return {
			paymentAuthorizationUrl: intializePayment.data.authorization_url,
			accessCode: intializePayment.data.access_code,
			paymentReference: order.paymentReference,
			payment_breakdown: {
				amount: order.amount,
				subtotalAmount: order.subtotalAmount,
				deliveryFee: order.deliveryFee,
				taxAmount: order.taxAmount,
			},
		};
	}

	async getOrderByPaymentReference(paymentReference: string) {
		return await this.userRepository.getOrderByPaymentReference(
			paymentReference,
		);
	}

	async updatePendingOrder(
		orderId: string,
		updateData: Partial<Omit<CreateOrder, "id" | "createdAt" | "updatedAt">>,
		transactions: MysqlDatabaseTransaction,
	) {
		return await this.userRepository.updatePendingOrder(
			orderId,
			updateData,
			transactions,
		);
	}

	async decrementServicesAndClearUserCart(userId: string) {
		return await this.userRepository.decrementServicesAndClearUserCart(userId);
	}

	async bulkUpdateVrgameTickets(
		ticketIds: string[],
		updateData: Partial<
			Omit<CreateVRGameTicketPurchase, "id" | "createdAt" | "updatedAt">
		>,
		transactions: MysqlDatabaseTransaction,
	) {
		return await this.userRepository.bulkUpdateVrgameTickets(
			ticketIds,
			updateData,
			transactions,
		);
	}

	async bulkUpdateMovieTickets(
		ticketIds: string[],
		updateData: Partial<
			Omit<CreateMovieTicketPurchase, "id" | "createdAt" | "updatedAt">
		>,
		transactions: MysqlDatabaseTransaction,
	) {
		return await this.userRepository.bulkUpdateMovieTickets(
			ticketIds,
			updateData,
			transactions,
		);
	}

	async bulkUpdateEquipmentRentalBookings(
		bookingIds: string[],
		updateData: Partial<
			Omit<CreateEquipmentRentalBooking, "id" | "createdAt" | "updatedAt">
		>,
		transactions: MysqlDatabaseTransaction,
	) {
		return await this.userRepository.bulkUpdateEquipmentRentalBookings(
			bookingIds,
			updateData,
			transactions,
		);
	}

	async bulkUpdateFoodOrders(
		orderIds: string[],
		updateData: Partial<
			Omit<CreateFoodOrder, "id" | "createdAt" | "updatedAt">
		>,
		transactions: MysqlDatabaseTransaction,
	) {
		return await this.userRepository.bulkUpdateFoodOrders(
			orderIds,
			updateData,
			transactions,
		);
	}

	async bulkUpdateHotelBookings(
		bookingIds: string[],
		updateData: Partial<
			Omit<CreateHotelBooking, "id" | "createdAt" | "updatedAt">
		>,
		transactions: MysqlDatabaseTransaction,
	) {
		return await this.userRepository.bulkUpdateHotelBookings(
			bookingIds,
			updateData,
			transactions,
		);
	}

	async bulkUpdateStudioBookings(
		bookingIds: string[],
		updateData: Partial<
			Omit<CreateStudioSessionBooking, "id" | "createdAt" | "updatedAt">
		>,
		transactions: MysqlDatabaseTransaction,
	) {
		return await this.userRepository.bulkUpdateStudioBookings(
			bookingIds,
			updateData,
			transactions,
		);
	}

	async getUserTickets({
		userId,
		page,
		limit,
	}: {
		userId: string;
		page: number;
		limit: number;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		const tickets = await this.userRepository.getUserTickets({
			userId,
			offset,
			limit,
		});

		return {
			tickets,
			prevPage: Number(page) > 1 ? Number(page) - 1 : null,
			nextPage: tickets.length === Number(limit) ? Number(page) + 1 : null,
			perPage: Number(limit),
		};
	}

	async getUserTicketDetailsById({
		ticketId,
		userId,
		ticketType,
	}: {
		ticketId: string;
		userId: string;
		ticketType: "studio" | "vrgame" | "movie";
	}) {
		return await this.userRepository.getUserTicketDetailsById({
			ticketId,
			userId,
			ticketType,
		});
	}

	async getUserReciepts({
		userId,
		page,
		limit,
	}: {
		userId: string;
		page: number;
		limit: number;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		const receipts = await this.userRepository.getUserReciepts({
			userId,
			offset,
			limit,
		});

		return {
			receipts,
			prevPage: Number(page) > 1 ? Number(page) - 1 : null,
			nextPage: receipts.length === Number(limit) ? Number(page) + 1 : null,
			perPage: Number(limit),
		};
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
		return await this.userRepository.getUserRecieptDetailsById({
			receiptId,
			userId,
			receiptType,
		});
	}

	async getUserOrders({
		userId,
		page,
		limit,
	}: {
		userId: string;
		page: number;
		limit: number;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		const orders = await this.userRepository.getUserOrders({
			userId,
			offset,
			limit,
		});

		return {
			orders,
			prevPage: Number(page) > 1 ? Number(page) - 1 : null,
			nextPage: orders.length === Number(limit) ? Number(page) + 1 : null,
			perPage: Number(limit),
		};
	}

	async getUserTransactions({
		userId,
		page,
		limit,
	}: {
		userId: string;
		page: number;
		limit: number;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		const transactions = await this.userRepository.getUserTransactions({
			userId,
			offset,
			limit,
		});

		return {
			transactions,
			prevPage: Number(page) > 1 ? Number(page) - 1 : null,
			nextPage: transactions.length === Number(limit) ? Number(page) + 1 : null,
			perPage: Number(limit),
		};
	}

	async getUserNotifications({
		userId,
		page,
		limit,
	}: {
		userId: string;
		page: number;
		limit: number;
	}) {
		const offset = (Number(page) - 1) * Number(limit);

		const notifications = await this.userRepository.getUserNotifications({
			userId,
			offset,
			limit,
		});

		return {
			notifications,
			prevPage: Number(page) > 1 ? Number(page) - 1 : null,
			nextPage:
				notifications.length === Number(limit) ? Number(page) + 1 : null,
			perPage: Number(limit),
		};
	}

	async markNotificationAsRead(notificationId: string, userId: string) {
		await this.userRepository.markNotificationAsRead(notificationId, userId);

		return {
			message: "Notification marked as read successfully",
		};
	}

	async markAllNotificationsAsRead(userId: string) {
		await this.userRepository.markAllNotificationsAsRead(userId);

		return {
			message: "All notifications marked as read successfully",
		};
	}

	async getUserDeliveryAddress(userId: string) {
		return await this.userRepository.getUserDeliveryAddress(userId);
	}
}
