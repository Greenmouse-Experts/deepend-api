import { boolean, text } from "drizzle-orm/mysql-core";
import { mysqlTable, int, decimal, timestamp } from "drizzle-orm/mysql-core";

export type CreateDeliverySettings = typeof adminDeliverySettings.$inferInsert;
export type CreateAdminNotification = typeof adminNotifications.$inferInsert;

export const adminDeliverySettings = mysqlTable("admin_delivery_settings", {
	id: int("id").primaryKey().autoincrement(),
	pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }).notNull(),
	originLat: decimal("origin_lat", { precision: 10, scale: 7 })
		.notNull()
		.default("0"),
	originLng: decimal("origin_lng", { precision: 10, scale: 7 })
		.notNull()
		.default("0"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminNotifications = mysqlTable("admin_notifications", {
	id: int("id").primaryKey().autoincrement(),
	title: text("title").notNull(),
	message: text("message").notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
