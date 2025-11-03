import { sql } from "drizzle-orm";
import { boolean } from "drizzle-orm/mysql-core";
import {
	varchar,
	decimal,
	mysqlTable,
	timestamp,
	foreignKey,
	int,
	date,
	time,
	check,
	json,
} from "drizzle-orm/mysql-core";
import { ID_GENERATOR_LENGTH } from "src/common/constants";
import { generateId, generateTicketId } from "src/common/helpers";

export type PaymentStatus = "pending" | "completed" | "failed";
export type OrderStatus = "pending" | "completed" | "failed";
export type HotelBookingStatus =
	| "pending"
	| "confirmed"
	| "cancelled"
	| "completed";

export type FoodOrderStatus =
	| "pending"
	| "preparing"
	| "delivered"
	| "cancelled";

export type MovieTicketPurchaseStatus = "pending" | "completed" | "canceled";

export type VRGameTicketPurchaseStatus = "pending" | "completed" | "cancelled";

export type EquipmentRentalBookingStatus =
	| "pending"
	| "ongoing"
	| "completed"
	| "cancelled";

export type StudioSessionBookingStatus =
	| "pending"
	| "scheduled"
	| "completed"
	| "cancelled";

export type CreatePaymentRecord = typeof Payments.$inferInsert;

export type CreateOrder = typeof orders.$inferInsert;
export type CreatePayment = typeof Payments.$inferInsert;
export type CreateHotelBooking = typeof hotelBookings.$inferInsert;
export type CreateFoodOrder = typeof foodOrders.$inferInsert;
export type CreateMovieTicketPurchase =
	typeof movieTicketPurchases.$inferInsert;
export type CreateVRGameTicketPurchase =
	typeof vrgameTicketPurchases.$inferInsert;
export type CreateEquipmentRentalBooking =
	typeof equipmentRentalBookings.$inferInsert;
export type CreateStudioSessionBooking =
	typeof studioSessionBookings.$inferInsert;

export const Payments = mysqlTable(
	"payments",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		orderId: varchar("order_id", { length: 191 }).notNull(),
		amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
		currency: varchar("currency", { length: 10 }).notNull().default("NGN"),
		status: varchar("status", { length: 50 })
			.notNull()
			.$type<"pending" | "successful" | "failed">(),
		paymentReference: varchar("payment_reference", { length: 15 })
			.notNull()
			.unique(),
		paymentChannel: varchar("payment_channel", { length: 100 }),
		paidAt: timestamp("paid_at", { mode: "string" }).notNull(),
		paymentDetails: json("payment_details").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
	},
	(table) => [
		check(
			"payments_status_check",
			sql`${table.status} IN ('pending', 'successful', 'failed')`,
		),
		foreignKey({
			name: "payments_order_fk",
			columns: [table.orderId],
			foreignColumns: [orders.id],
		}),
	],
);

export const orders = mysqlTable(
	"orders",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: varchar("user_id", { length: 191 }).notNull(),
		paymentReference: varchar("payment_reference", { length: 15 })
			.notNull()
			.unique(),
		deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 })
			.notNull()
			.default("0"),
		taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
		subtotalAmount: decimal("subtotal_amount", {
			precision: 10,
			scale: 2,
		}).notNull(),
		totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
		paymentMethod: varchar("payment_method", { length: 50 })
			.notNull()
			.$type<"paystack">(),
		currency: varchar("currency", { length: 10 }).notNull().$type<"NGN">(),
		status: varchar("status", { length: 50 })
			.notNull()
			.default("pending")
			.$type<"pending" | "completed" | "failed">(),
		orderDetails: json("order_details")
			.$type<
				{
					type: "hotel" | "food" | "movie" | "vrgame" | "equipment" | "studio";
					ticketId: string | null;
					userId: string;
					itemId: string;
					orderId: string;
				}[]
			>()
			.default([])
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
	},
	(table) => [
		check(
			"orders_status_check",
			sql`${table.status} IN ('pending', 'completed', 'failed')`,
		),
		check(
			"payments_payment_method_check",
			sql`${table.paymentMethod} IN ('paystack')`,
		),
		check(
			"check_order_details_not_empty",
			sql`${table.status} != 'completed' OR JSON_LENGTH(${table.orderDetails}) > 0`,
		),
	],
);

export const hotelBookings = mysqlTable(
	"hotel_bookings",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: varchar("user_id", { length: 191 }).notNull(),
		orderId: varchar("order_id", { length: 191 }).notNull(),
		hotelName: varchar("hotel_name", { length: 255 }).notNull(),
		hotelImageUrl: varchar("hotel_image_url", { length: 500 }).notNull(),
		hotelId: varchar("hotel_id", { length: 191 }).notNull(),
		hotelRoomId: varchar("hotel_room_id", { length: 191 }).notNull(),
		hotelRoomName: varchar("hotel_room_name", { length: 255 }).notNull(),
		hotelRoomPricePerNight: decimal("hotel_room_price_per_night", {
			precision: 10,
			scale: 2,
		}).notNull(),
		checkInDate: date("check_in_date", { mode: "string" }).notNull(),
		checkOutDate: date("check_out_date", { mode: "string" }).notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		currency: varchar("currency", { length: 10 }).notNull().default("NGN"),
		qrcodeData: json("qrcode_data"),
		recieptBarcodeData: varchar("reciept_barcode_data", { length: 1000 }),
		status: varchar("status", { length: 50 })
			.notNull()
			.default("pending")
			.$type<"pending" | "confirmed" | "cancelled" | "completed">(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "hotel_bookings_order_fk",
			columns: [table.orderId],
			foreignColumns: [orders.id],
		}),
		check(
			"hotel_bookings_status_check",
			sql`status IN ('pending', 'confirmed', 'cancelled', 'completed')`,
		),
	],
);

export const foodOrders = mysqlTable(
	"food_orders",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: varchar("user_id", { length: 191 }).notNull(),
		orderId: varchar("order_id", { length: 191 }).notNull(),
		foodId: varchar("food_id", { length: 191 }).notNull(),
		foodName: varchar("food_name", { length: 255 }).notNull(),
		foodImageUrl: varchar("food_image_url", { length: 500 }).notNull(),
		quantity: int("quantity").notNull(),
		foodPrice: decimal("food_price", { precision: 10, scale: 2 }).notNull(),
		foodAddons: json("food_addons")
			.$type<{ addonId: number; addonName: string; addonPrice: string }[]>()
			.default([])
			.notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		currency: varchar("currency", { length: 10 }).notNull().default("NGN"),
		deliveryType: varchar("delivery_type", { length: 50 })
			.notNull()
			.$type<"pickup" | "delivery">(),
		deliveryAddress: varchar("delivery_address", { length: 500 }),
		specialInstructions: varchar("special_instructions", {
			length: 500,
		}).default(""),
		recieptBarcodeData: varchar("reciept_barcode_data", { length: 1000 }),
		status: varchar("status", { length: 50 })
			.notNull()
			.default("pending")
			.$type<"pending" | "preparing" | "delivered" | "cancelled">(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "food_orders_order_fk",
			columns: [table.orderId],
			foreignColumns: [orders.id],
		}),
		check(
			"food_orders_delivery_type_check",
			sql`delivery_type IN ('pickup', 'delivery')`,
		),
		check(
			"food_orders_delivery_address_check",
			sql`(${table.deliveryType} = 'delivery' AND ${table.deliveryAddress} IS NOT NULL) OR (${table.deliveryType} = 'pickup')`,
		),
		check(
			"food_orders_status_check",
			sql`status IN ('pending', 'preparing', 'delivered', 'cancelled')`,
		),
	],
);

export const movieTicketPurchases = mysqlTable(
	"movie_ticket_purchases",
	{
		ticketId: varchar("ticket_id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateTicketId())
			.primaryKey(),
		userId: varchar("user_id", { length: 191 }).notNull(),
		orderId: varchar("order_id", { length: 191 }).notNull(),
		movieId: varchar("movie_id", { length: 191 }).notNull(),
		movieName: varchar("movie_name", { length: 255 }).notNull(),
		movieImageUrl: varchar("movie_image_url", { length: 500 }).notNull(),
		cinemaHallId: varchar("cinema_hall_id", { length: 191 }).notNull(),
		genre: varchar("genre", { length: 100 }).notNull(),
		cinemaHallName: varchar("cinema_hall_name", { length: 255 }).notNull(),
		location: varchar("location", { length: 255 }).notNull(),
		ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
		ticketQuantity: int("ticket_quantity").notNull(),
		showDate: date("show_date", { mode: "string" }).notNull(),
		showtime: time("showtime").notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		purchaseDate: timestamp("purchase_date", { fsp: 6 }).defaultNow().notNull(),
		isUsed: boolean("is_used").default(false).notNull(),
		qrcodeData: json("qrcode_data"),
		recieptBarcodeData: varchar("reciept_barcode_data", { length: 1000 }),
		verifiedAt: timestamp("verified_at", { mode: "string" }),
		verifiedBy: varchar("verified_by", { length: ID_GENERATOR_LENGTH }),
		snackAddOns: json("snack_add_ons")
			.$type<
				{
					snackId: number;
					snackName: string;
					snackPrice: string;
					snackQuantity: number;
				}[]
			>()
			.default([])
			.notNull(),
		currency: varchar("currency", { length: 10 }).notNull().default("NGN"),
		status: varchar("status", { length: 50 })
			.$type<"pending" | "completed" | "cancelled">()
			.default("pending")
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "movie_ticket_purchases_order_fk",
			columns: [table.orderId],
			foreignColumns: [orders.id],
		}),
		check(
			"movie_ticket_purchases_status_check",
			sql`status IN ('pending' ,'completed', 'cancelled')`,
		),
	],
);

export const vrgameTicketPurchases = mysqlTable(
	"vrgame_ticket_purchases",
	{
		ticketId: varchar("ticket_id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateTicketId())
			.primaryKey(),
		userId: varchar("user_id", { length: 191 }).notNull(),
		orderId: varchar("order_id", { length: 191 }).notNull(),
		vrgameId: varchar("vrgame_center_id", { length: 191 }).notNull(),
		vrgameName: varchar("vrgame_center_name", { length: 255 }).notNull(),
		vrgameImageUrl: varchar("vrgame_center_image_url", {
			length: 500,
		}).notNull(),
		vrgameCategory: varchar("vrgame_category", { length: 100 }).notNull(),
		ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
		ticketQuantity: int("ticket_quantity").notNull(),
		scheduledDate: date("scheduled_date", { mode: "string" }).notNull(),
		scheduledTime: time("scheduled_time").notNull(),
		purchaseDate: timestamp("purchase_date", { fsp: 6 }).defaultNow().notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		currency: varchar("currency", { length: 10 }).notNull().default("NGN"),
		isUsed: boolean("is_used").default(false).notNull(),
		qrcodeData: json("qrcode_data"),
		recieptBarcodeData: varchar("reciept_barcode_data", { length: 1000 }),
		verifiedAt: timestamp("verified_at", { mode: "string" }),
		verifiedBy: varchar("verified_by", { length: ID_GENERATOR_LENGTH }),
		status: varchar("status", { length: 50 })
			.default("pending")
			.$type<"pending" | "completed" | "cancelled">()
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "vrgame_ticket_purchases_order_fk",
			columns: [table.orderId],
			foreignColumns: [orders.id],
		}),
		check(
			"vrgame_ticket_purchases_status_check",
			sql`status IN ('pending', 'completed', 'cancelled')`,
		),
	],
);

export const equipmentRentalBookings = mysqlTable(
	"equipment_rental_bookings",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: varchar("user_id", { length: 191 }).notNull(),
		orderId: varchar("order_id", { length: 191 }).notNull(),
		equipmentId: varchar("equipment_id", { length: 191 }).notNull(),
		equipmentName: varchar("equipment_name", { length: 255 }).notNull(),
		equipmentImageUrl: varchar("equipment_image_url", {
			length: 500,
		}).notNull(),
		rentalPricePerDay: decimal("rental_price_per_day", {
			precision: 10,
			scale: 2,
		}).notNull(),
		address: varchar("address", { length: 500 }).notNull(),
		rentalStartDate: date("rental_start_date", { mode: "string" }).notNull(),
		rentalEndDate: date("rental_end_date", { mode: "string" }).notNull(),
		quantity: int("quantity").notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		recieptBarcodeData: varchar("reciept_barcode_data", { length: 1000 }),
		currency: varchar("currency", { length: 10 }).notNull().default("NGN"),
		status: varchar("status", { length: 50 })
			.default("pending")
			.$type<"ongoing" | "completed" | "cancelled">()
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "equipment_rental_bookings_order_fk",
			columns: [table.orderId],
			foreignColumns: [orders.id],
		}),
		check(
			"equipment_rental_bookings_status_check",
			sql`status IN ('pending', 'ongoing', 'completed', 'cancelled')`,
		),
	],
);

export const studioSessionBookings = mysqlTable(
	"studio_session_bookings",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: varchar("user_id", { length: 191 }).notNull(),
		orderId: varchar("order_id", { length: 191 }).notNull(),
		studioId: int("studio_id").notNull(),
		studioName: varchar("studio_name", { length: 255 }).notNull(),
		sessionPricePerHour: decimal("session_price_per_hour", {
			precision: 10,
			scale: 2,
		}).notNull(),
		sessionDate: date("session_date", { mode: "string" }).notNull(),
		sessionStartTime: time("session_start_time").notNull(),
		sessionEndTime: time("session_end_time").notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		currency: varchar("currency", { length: 10 }).notNull().default("NGN"),
		qrcodeData: json("qrcode_data"),
		recieptBarcodeData: varchar("reciept_barcode_data", { length: 1000 }),
		verifiedAt: timestamp("verified_at", { mode: "string" }),
		verifiedBy: varchar("verified_by", { length: ID_GENERATOR_LENGTH }),
		status: varchar("status", { length: 50 })
			.$type<"pending" | "scheduled" | "completed" | "cancelled">()
			.default("pending")
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "studio_session_bookings_order_fk",
			columns: [table.orderId],
			foreignColumns: [orders.id],
		}),
		check(
			"studio_session_bookings_status_check",
			sql`status IN ('pending', 'scheduled', 'completed', 'cancelled')`,
		),
	],
);
