// import {
// 	varchar,
// 	timestamp,
// 	mysqlTable,
// 	uniqueIndex,
// } from "drizzle-orm/mysql-core";
// import { ID_GENERATOR_LENGTH } from "src/common/constants";
// import { generateId } from "src/common/helpers";
// import { users } from "./users";
// import { sql } from "drizzle-orm";
// import { check } from "drizzle-orm/mysql-core";
// import { date } from "drizzle-orm/mysql-core";
// import { time } from "drizzle-orm/mysql-core";
//
// export type AddToCartType = typeof cartItems.$inferInsert;
// export type AddonToCartType = typeof cartItemAddons.$inferInsert;
//
// export const carts = mysqlTable(
// 	"carts",
// 	{
// 		id: varchar("id", { length: ID_GENERATOR_LENGTH })
// 			.primaryKey()
// 			.$defaultFn(() => generateId()),
// 		userId: varchar("user_id", { length: ID_GENERATOR_LENGTH })
// 			.notNull()
// 			.references(() => users.id),
// 		status: varchar("status", { length: 50 })
// 			.notNull()
// 			.$type<"active" | "checked_out" | "abandoned">(),
// 		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
// 		updatedAt: timestamp("updated_at", { fsp: 6 })
// 			.$onUpdateFn(() => new Date())
// 			.notNull(),
// 	},
// 	(table) => [
// 		check(
// 			"chk_cart_status",
// 			sql`${table.status} IN ('active', 'checked_out', 'abandoned')`,
// 		),
// 		uniqueIndex("idx_user_active_cart").on(
// 			sql`CASE WHEN ${table.status} = 'active' THEN ${table.userId} ELSE NULL END`,
// 		),
// 	],
// );
//
// export const cartItems = mysqlTable(
// 	"cart_items",
// 	{
// 		id: varchar("id", { length: ID_GENERATOR_LENGTH })
// 			.primaryKey()
// 			.$defaultFn(() => generateId()),
// 		cartId: varchar("cart_id", { length: ID_GENERATOR_LENGTH })
// 			.notNull()
// 			.references(() => carts.id),
// 		serviceType: varchar("service_type", { length: 50 })
// 			.notNull()
// 			.$type<"vrgames" | "movie" | "hotel" | "food">(),
// 		serviceId: varchar("service_id", { length: ID_GENERATOR_LENGTH }).notNull(),
// 		quantity: varchar("quantity", { length: 10 }).notNull(),
// 		scheduledDate: date("scheduled_date"), // for services that require scheduling
// 		scheduledStartTime: time("scheduled_start_time"), // HH:MM
// 		scheduledEndTime: time("scheduled_end_time"),
// 		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
// 		updatedAt: timestamp("updated_at", { fsp: 6 })
// 			.$onUpdateFn(() => new Date())
// 			.notNull(),
// 	},
// 	(table) => [
// 		uniqueIndex("idx_cart_service_unique").on(table.cartId, table.serviceId),
// 		check(
// 			"chk_service_type",
// 			sql`${table.serviceType} IN ('vrgames', 'movie', 'hotel', 'food')`,
// 		),
// 	],
// );
//
// export const cartItemAddons = mysqlTable(
// 	"cart_item_addons",
// 	{
// 		id: varchar("id", { length: ID_GENERATOR_LENGTH })
// 			.primaryKey()
// 			.$defaultFn(() => generateId()),
// 		cartItemId: varchar("cart_item_id", { length: ID_GENERATOR_LENGTH })
// 			.notNull()
// 			.references(() => cartItems.id),
// 		addonType: varchar("addon_type", { length: 50 })
// 			.notNull()
// 			.$type<"vrgames" | "movie" | "hotel" | "food">(),
// 		addonId: varchar("addon_id", { length: ID_GENERATOR_LENGTH }).notNull(),
// 		quantity: varchar("quantity", { length: 10 }).notNull(),
// 		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
// 		updatedAt: timestamp("updated_at", { fsp: 6 })
// 			.$onUpdateFn(() => new Date())
// 			.notNull(),
// 	},
// 	(table) => [
// 		check(
// 			"chk_addon_type",
// 			sql`${table.addonType} IN ('vrgames', 'movie', 'hotel', 'food')`,
// 		),
// 	],
// );
