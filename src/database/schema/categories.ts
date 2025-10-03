import {
	int,
	text,
	timestamp,
	varchar,
	mysqlTable,
	decimal,
	json,
	boolean,
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

export const advertBanners = mysqlTable("advert_banners", {
	id: int("id").primaryKey().autoincrement(),
	name: varchar("name", { length: 255 }).notNull(),
	imageUrls: json("image_urls")
		.$type<Array<{ url: string; path: string }>>()
		.notNull(),
	linkUrl: text("link_url").notNull(),
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export const vrgamesCategories = mysqlTable("vrgames_categories", {
	id: int("id").primaryKey().autoincrement(),
	name: varchar("name", { length: 255 }).notNull().unique(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$onUpdateFn(() => new Date()),
});
