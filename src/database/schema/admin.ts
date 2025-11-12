import { mysqlTable, int, decimal, timestamp } from "drizzle-orm/mysql-core";

export type CreateDeliverySettings = typeof adminDeliverySettings.$inferInsert;

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
