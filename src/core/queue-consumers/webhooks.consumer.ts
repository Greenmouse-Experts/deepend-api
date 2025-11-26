import { Processor, WorkerHost } from "@nestjs/bullmq";
import {
	SUCCESSFUL_PAYMENT_WEBHOOK,
	WEBHOOKS_QUEUE,
} from "src/common/constants";
import { Logger } from "@nestjs/common";
import { PaystackSuccessfulPaymentWebhookPayload } from "./webhooks.types";
import Decimal from "decimal.js";
import { PaymentService } from "../payment/payment.service";
import { UserService } from "../user/user.service";
import {
	generateOrderDescription,
	generateReceiptBarcodeData,
	generateTicketQrCodeData,
} from "src/common/helpers";
import {
	equipmentRentalBookings,
	EquipmentRentalBookingStatus,
	foodOrders,
	FoodOrderStatus,
	hotelBookings,
	HotelBookingStatus,
	movieTicketPurchases,
	MovieTicketPurchaseStatus,
	studioSessionBookings,
	StudioSessionBookingStatus,
	vrgameTicketPurchases,
	VRGameTicketPurchaseStatus,
} from "src/database/schema";
import { bulkUpdateReciepts, bulkUpdateTickets } from "src/common/bulkupdates";
import { MailService } from "src/mail/mail.service";
import { NotificationService } from "../notification/notification.service";

const TICKET_QR_CODE_SECRET_KEY = process.env.TICKET_QR_CODE_SECRET_KEY;
const RECEIPT_BARCODE_SECRET_KEY = process.env.RECEIPT_BARCODE_SECRET_KEY;

@Processor(WEBHOOKS_QUEUE)
export class WebhooksConsumer extends WorkerHost {
	private logger = new Logger(WebhooksConsumer.name);

	constructor(
		private readonly paymentService: PaymentService,
		private readonly userService: UserService,
		private readonly mailService: MailService,
		private readonly notificationService: NotificationService,
	) {
		super();
	}

	async process(job: any, _?: string): Promise<unknown | Error> {
		switch (job.name) {
			case SUCCESSFUL_PAYMENT_WEBHOOK: {
				const { body } = job.data as PaystackSuccessfulPaymentWebhookPayload;

				const webhookPayload = body.data;

				this.logger.log(
					`Processing webhook event: ${JSON.stringify(body.event)}`,
				);

				try {
					const order = await this.userService.getOrderByPaymentReference(
						webhookPayload.reference,
					);

					if (!order) {
						this.logger.warn(
							`No order found for payment reference ${webhookPayload.reference}`,
						);
						return new Error(
							`No order found for payment reference ${webhookPayload.reference}`,
						);
					}

					if (order.status === "completed") {
						this.logger.log(
							`Order for payment reference ${webhookPayload.reference} is already completed`,
						);

						return { success: true };
					}

					let transactionStatus: "successful" | "failed" | "pending";
					switch (webhookPayload.status) {
						case "success":
							transactionStatus = "successful";
							break;
						case "failed":
							transactionStatus = "failed";
							break;
						default:
							transactionStatus = "pending";
					}

					if (
						!new Decimal(webhookPayload.amount)
							.dividedBy(100)
							.equals(
								new Decimal(order.subtotalAmount)
									.plus(order.deliveryFee)
									.plus(order.taxAmount || "0"),
							)
					) {
						this.logger.warn(
							`Amount mismatch for transaction reference ${webhookPayload.reference}. Expected ${
								Number(order.subtotalAmount) +
								Number(order.deliveryFee) +
								Number(order.taxAmount) / 100
							}, got ${webhookPayload.amount}`,
						);
						return new Error(
							`Amount mismatch for transaction reference ${webhookPayload.reference}. Expected ${
								Number(order.subtotalAmount) +
								Number(order.deliveryFee) +
								Number(order.taxAmount) / 100
							}, got ${webhookPayload.amount}`,
						);
					}

					const databaseConnection =
						await this.userService.getDatabaseConnection();

					await databaseConnection.transaction(async (transactions) => {
						if (transactionStatus === "successful") {
							await this.paymentService.createPaymentRecord(
								{
									orderId: order.id,
									amount: new Decimal(webhookPayload.amount)
										.dividedBy(100)
										.toString(),
									status: transactionStatus,
									paymentReference: webhookPayload.reference,
									paymentChannel: webhookPayload.channel,
									paymentDetails: webhookPayload,
									paidAt: webhookPayload.paid_at
										? new Date(webhookPayload.paid_at)
												.toISOString()
												.slice(0, 19)
												.replace("T", " ")
										: new Date().toISOString(),
								},
								transactions,
							);

							await this.userService.updatePendingOrder(
								order.id,
								{
									status: "completed",
								},
								transactions,
							);

							let vrgamesTicketUpdates: {
								ticketId: string;
								status: VRGameTicketPurchaseStatus;
								qrcodeData: string;
								recieptBarcodeData: string;
								purchaseDate: string;
							}[] = [];

							let movieTicketUpdates: {
								ticketId: string;
								status: MovieTicketPurchaseStatus;
								qrcodeData: string;
								recieptBarcodeData: string;
								purchaseDate: string;
							}[] = [];

							let studioSessionBookingUpdates: {
								ticketId: string;
								status: StudioSessionBookingStatus;
								qrcodeData: string;
								recieptBarcodeData: string;
							}[] = [];

							let equipmentRentalRecieptUpdates: {
								id: string;
								status: EquipmentRentalBookingStatus;
								recieptBarcodeData: string;
							}[] = [];

							let foodOrderRecieptUpdates: {
								id: string;
								status: FoodOrderStatus;
								recieptBarcodeData: string;
							}[] = [];

							let hotelBookingRecieptUpdates: {
								id: string;
								status: HotelBookingStatus;
								qrcodeData: string;
								recieptBarcodeData: string;
							}[] = [];

							for (const item of order.orderDetails) {
								switch (item.type) {
									case "vrgame":
										vrgamesTicketUpdates.push({
											ticketId: item.itemId,
											status: "completed",
											qrcodeData: generateTicketQrCodeData({
												ticketId: item.itemId,
												userId: order.userId,
												secretKey: TICKET_QR_CODE_SECRET_KEY || "",
											}),
											recieptBarcodeData: generateReceiptBarcodeData(
												item.itemId,
												RECEIPT_BARCODE_SECRET_KEY || "",
											),
											purchaseDate: new Date()
												.toISOString()
												.slice(0, 19)
												.replace("T", " "),
										});
										break;
									case "movie":
										movieTicketUpdates.push({
											ticketId: item.itemId,
											status: "completed",
											qrcodeData: generateTicketQrCodeData({
												ticketId: item.itemId,
												userId: order.userId,
												secretKey: TICKET_QR_CODE_SECRET_KEY || "",
											}),
											recieptBarcodeData: generateReceiptBarcodeData(
												item.itemId,
												RECEIPT_BARCODE_SECRET_KEY || "",
											),
											purchaseDate: new Date()
												.toISOString()
												.slice(0, 19)
												.replace("T", " "),
										});
										break;
									case "studio":
										studioSessionBookingUpdates.push({
											ticketId: item.itemId,
											status: "scheduled",
											qrcodeData: generateTicketQrCodeData({
												ticketId: item.itemId,
												userId: order.userId,
												secretKey: TICKET_QR_CODE_SECRET_KEY || "",
											}),
											recieptBarcodeData: generateReceiptBarcodeData(
												item.itemId,
												RECEIPT_BARCODE_SECRET_KEY || "",
											),
										});
										break;
									case "equipment":
										equipmentRentalRecieptUpdates.push({
											id: item.itemId,
											status: "ongoing",
											recieptBarcodeData: "",
										});
										break;
									case "food":
										foodOrderRecieptUpdates.push({
											id: item.itemId,
											status: "confirmed",
											recieptBarcodeData: generateReceiptBarcodeData(
												item.itemId,
												RECEIPT_BARCODE_SECRET_KEY || "",
											),
										});
										break;
									case "hotel":
										hotelBookingRecieptUpdates.push({
											id: item.itemId,
											status: "confirmed",
											qrcodeData: generateTicketQrCodeData({
												ticketId: item.itemId,
												userId: order.userId,
												secretKey: TICKET_QR_CODE_SECRET_KEY || "",
											}),
											recieptBarcodeData: generateReceiptBarcodeData(
												item.itemId,
												RECEIPT_BARCODE_SECRET_KEY || "",
											),
										});
										break;
								}

								if (vrgamesTicketUpdates.length > 0) {
									const { ids, sqlFragments } = bulkUpdateTickets(
										vrgameTicketPurchases.ticketId,
										vrgamesTicketUpdates,
										[
											"status",
											"qrcodeData",
											"recieptBarcodeData",
											"purchaseDate",
										],
									);

									await this.userService.bulkUpdateVrgameTickets(
										ids,
										sqlFragments,
										transactions,
									);
								}

								if (movieTicketUpdates.length > 0) {
									const { ids, sqlFragments } = bulkUpdateTickets(
										movieTicketPurchases.ticketId,
										movieTicketUpdates,
										[
											"status",
											"qrcodeData",
											"recieptBarcodeData",
											"purchaseDate",
										],
									);

									await this.userService.bulkUpdateMovieTickets(
										ids,
										sqlFragments,
										transactions,
									);
								}

								if (studioSessionBookingUpdates.length > 0) {
									const { ids, sqlFragments } = bulkUpdateTickets(
										studioSessionBookings.id,
										studioSessionBookingUpdates,
										["status", "qrcodeData", "recieptBarcodeData"],
									);

									await this.userService.bulkUpdateStudioBookings(
										ids,
										sqlFragments,
										transactions,
									);
								}
							}

							if (equipmentRentalRecieptUpdates.length > 0) {
								const { ids, sqlFragments } = bulkUpdateReciepts(
									equipmentRentalBookings.id,
									equipmentRentalRecieptUpdates,
									["status", "recieptBarcodeData"],
								);

								await this.userService.bulkUpdateEquipmentRentalBookings(
									ids,
									sqlFragments,
									transactions,
								);
							}

							if (foodOrderRecieptUpdates.length > 0) {
								const { ids, sqlFragments } = bulkUpdateReciepts(
									foodOrders.id,
									foodOrderRecieptUpdates,
									["status", "recieptBarcodeData"],
								);

								await this.userService.bulkUpdateFoodOrders(
									ids,
									sqlFragments,
									transactions,
								);
							}

							if (hotelBookingRecieptUpdates.length > 0) {
								const { ids, sqlFragments } = bulkUpdateReciepts(
									hotelBookings.id,
									hotelBookingRecieptUpdates,
									["status", "qrcodeData", "recieptBarcodeData"],
								);

								await this.userService.bulkUpdateHotelBookings(
									ids,
									sqlFragments,
									transactions,
								);
							}

							const orderItems = await this.userService.getUserCart(
								order.userId,
							);

							await this.userService.decrementServicesAndClearUserCart(
								order.userId,
							);

							await this.mailService.sendSuccessfulPayment({
								email: webhookPayload.customer?.email as string,
								paymentData: {
									customer: {
										firstName: webhookPayload.customer?.first_name as string,
									},
									order: {
										orderNumber: order.id,
										items: orderItems.map((order) => ({
											icon: order.picture as string,
											name: order.name as string,
											description: generateOrderDescription(
												order.cartItemType,
												order.quantity,
												order.name as string,
											),
											price: order.totalPrice,
										})),
										total: order.totalAmount,
									},
									payment: {
										method: order.paymentMethod,
										date: new Date(webhookPayload.paid_at as string)
											.toISOString()
											.slice(0, 19)
											.replace("T", " "),
										transactionId: webhookPayload.reference,
									},
									support: {
										email: process.env.DEEPEND_SUPPORT_EMAIL as string,
										phone: process.env.DEEPEND_SUPPORT_PHONE as string,
									},
								},
							});

							const user = await this.userService.getUserById(order.userId);

							if (user) {
								await this.notificationService.sendNotification({
									userId: order.userId,
									message: {
										notification: {
											title: "Payment Successful",
											body: `Your payment of N${order.totalAmount} for order ${order.id} was successful.`,
										},
									},
									token: user.fcmToken,
								});
							}

							return { success: true };
						}
					});

					this.logger.log(
						`Successfully processed webhook event for payment reference ${webhookPayload.reference}`,
					);
				} catch (error) {
					console.error(error);
					this.logger.error(`Error processing webhook event: ${error.message}`);
					return error;
				}
				break;
			}
			default:
				this.logger.warn(`Unknown job name: ${job.name}`);
				return new Error(`Unknown job name: ${job.name}`);
		}
	}
}
