import {
	int,
	text,
	timestamp,
	varchar,
	mysqlTable,
	decimal,
} from "drizzle-orm/mysql-core";

export const foodCategories = mysqlTable("food_categories", {
	id: int("id").primaryKey().autoincrement(),
	name: varchar("name", { length: 255 }).notNull().unique(),
	description: text("description"),
	icon: text("icon"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export const foodAddonCategories = mysqlTable("food_addon_categories", {
	id: int("id").primaryKey().autoincrement(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export const foodAddonsItems = mysqlTable("food_addons_items", {
	id: int("id").primaryKey().autoincrement(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	description: text("description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	categoryId: int("category_id")
		.references(() => foodAddonCategories.id)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$onUpdateFn(() => new Date()),
});
