import {
	decimal,
	varchar,
	mysqlTable,
	json,
	timestamp,
	int,
	boolean,
	primaryKey,
	foreignKey,
} from "drizzle-orm/mysql-core";
import {
	equipmentCategories,
	foodAddonCategories,
	foodAddonsItems,
	foodCategories,
	vrgamesCategories,
} from "./categories";
import { ID_GENERATOR_LENGTH } from "src/common/constants";
import { generateId } from "src/common/helpers";
import { relations } from "drizzle-orm";
import { point } from "../customTypes";

export type CreateFood = typeof foods.$inferInsert;
export type CreateVRGame = typeof vrgames.$inferInsert;
export type CreateHotelAmenity = typeof hotelAmenities.$inferInsert;
export type CreateHotel = typeof hotels.$inferInsert;
export type CreateHotelRoom = typeof hotelRooms.$inferInsert;
export type CreateEquipmentRentals = typeof equipmentRentals.$inferInsert;

export const foods = mysqlTable("foods", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	description: varchar("description", { length: 1024 }),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	categoryId: int("category_id")
		.notNull()
		.references(() => foodCategories.id),
	imageUrls: json("image_urls").$type<object[]>().default([]).notNull(),
	quantity: int("quantity").default(1).notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type FoodToAddonsCategories = typeof foodToAddonsCategories.$inferInsert;

export const foodToAddonsCategories = mysqlTable(
	"food_to_addons_categories",
	{
		foodId: varchar("food_id", { length: ID_GENERATOR_LENGTH })
			.notNull()
			.references(() => foods.id),
		addonCategoryId: int("addon_category_id").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.foodId, table.addonCategoryId] }),
		foreignKey({
			name: "fk_food_to_addon_category_id",
			columns: [table.addonCategoryId],
			foreignColumns: [foodAddonCategories.id],
		}),
	],
);

export type FoodToAddonsItems = typeof foodToAddonsItems.$inferInsert;

export const foodToAddonsItems = mysqlTable(
	"food_to_addons_items",
	{
		foodId: varchar("food_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		addonCategoryId: int("addon_category_id").notNull(),
		addonItemId: int("addon_item_id")
			.references(() => foodAddonsItems.id)
			.notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.foodId, table.addonItemId] }),

		foreignKey({
			name: "fk_food_to_addon_item_category_id",
			columns: [table.addonCategoryId],
			foreignColumns: [foodAddonCategories.id],
		}),

		foreignKey({
			name: "fk_food_to_addon_item_food_id_category_id",
			columns: [table.foodId, table.addonCategoryId],
			foreignColumns: [
				foodToAddonsCategories.foodId,
				foodToAddonsCategories.addonCategoryId,
			],
		}),

		foreignKey({
			name: "fk_food_to_addon_item_category_item_id",
			columns: [table.addonCategoryId, table.addonItemId],
			foreignColumns: [foodAddonsItems.categoryId, foodAddonsItems.id],
		}),
	],
);

export const foodsRelations = relations(foods, ({ one, many }) => ({
	category: one(foodCategories, {
		fields: [foods.categoryId],
		references: [foodCategories.id],
	}),
	addons: many(foodToAddonsCategories),
}));

export const foodAddonCategoriesRelations = relations(
	foodAddonCategories,
	({ many }) => ({
		items: many(foodAddonsItems),
		foodToAddonsCategories: many(foodToAddonsCategories),
	}),
);

export const foodAddonsItemsRelations = relations(
	foodAddonsItems,
	({ one }) => ({
		category: one(foodAddonCategories, {
			fields: [foodAddonsItems.categoryId],
			references: [foodAddonCategories.id],
		}),
	}),
);

export const foodToAddonsCategoriesRelations = relations(
	foodToAddonsCategories,
	({ one }) => ({
		food: one(foods, {
			fields: [foodToAddonsCategories.foodId],
			references: [foods.id],
		}),
		category: one(foodAddonCategories, {
			fields: [foodToAddonsCategories.addonCategoryId],
			references: [foodAddonCategories.id],
		}),
	}),
);

export const vrgames = mysqlTable("vrgames", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	description: varchar("description", { length: 1024 }),
	categoryId: int("category_id")
		.notNull()
		.references(() => vrgamesCategories.id),
	imageUrls: json("image_urls")
		.$type<{ url: string; path: string }[]>()
		.default([])
		.notNull(),
	ageRating: int("age_rating").default(0).notNull(),
	ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
	ticketQuantity: int("tikcet_quantity").default(1).notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const hotels = mysqlTable("hotels", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	description: varchar("description", { length: 1024 }),
	address: varchar("address", { length: 512 }).notNull(),
	city: varchar("city", { length: 255 }).notNull(),
	state: varchar("state", { length: 255 }).notNull(),
	country: varchar("country", { length: 255 }).notNull(),
	imageUrls: json("image_urls")
		.$type<{ url: string; path: string }[]>()
		.default([])
		.notNull(),
	rating: decimal("rating", { precision: 2, scale: 1 }).default("0").notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	coordinates: point("coordinates").notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const hotelRooms = mysqlTable("hotel_rooms", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	hotelId: varchar("hotel_id", { length: ID_GENERATOR_LENGTH })
		.notNull()
		.references(() => hotels.id, { onDelete: "cascade" }),
	name: varchar("name", { length: 255 }).notNull(),
	description: varchar("description", { length: 1024 }),
	pricePerNight: decimal("price_per_night", {
		precision: 10,
		scale: 2,
	}).notNull(),
	imageUrls: json("image_urls")
		.$type<{ url: string; path: string }[]>()
		.default([])
		.notNull(),
	capacity: int("capacity").default(1).notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const hotelAmenities = mysqlTable("hotel_amenities", {
	id: int("id").autoincrement().primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
	icon: varchar("icon", { length: 255 }).notNull(),
	iconPath: varchar("icon_path", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export const hotelToAmenities = mysqlTable(
	"hotel_to_amenities",
	{
		hotelId: varchar("hotel_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		amenityId: int("amenity_id").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.hotelId, table.amenityId] }),
		foreignKey({
			name: "fk_hotel_to_amenity_hotel_id",
			columns: [table.hotelId],
			foreignColumns: [hotels.id],
		}).onDelete("cascade"),
		foreignKey({
			name: "fk_hotel_to_amenity_amenity_id",
			columns: [table.amenityId],
			foreignColumns: [hotelAmenities.id],
		}).onDelete("cascade"),
	],
);

export const hotelRelations = relations(hotels, ({ many }) => ({
	rooms: many(hotelRooms),
	amenities: many(hotelToAmenities),
}));

export const hotelToAmenitiesRelations = relations(
	hotelToAmenities,
	({ one }) => ({
		amenity: one(hotelAmenities, {
			fields: [hotelToAmenities.amenityId],
			references: [hotelAmenities.id],
		}),
		hotel: one(hotels, {
			fields: [hotelToAmenities.hotelId],
			references: [hotels.id],
		}),
	}),
);

export const hotelRoomsRelations = relations(hotelRooms, ({ one }) => ({
	hotel: one(hotels, {
		fields: [hotelRooms.hotelId],
		references: [hotels.id],
	}),
}));

export const equipmentRentals = mysqlTable(
	"equipment_rentals",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		name: varchar("name", { length: 255 }).unique().notNull(),
		description: varchar("description", { length: 1024 }),
		categoryId: int("category_id").notNull(),
		imageUrls: json("image_urls")
			.$type<{ url: string; path: string }[]>()
			.default([])
			.notNull(),
		rentalPricePerDay: decimal("rental_price_per_day", {
			precision: 10,
			scale: 2,
		}).notNull(),
		address: varchar("address", { length: 512 }).notNull(),
		quantityAvailable: int("quantity_available").default(1).notNull(),
		isAvailable: boolean("is_available").default(false).notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_equipment_rentals_category_id",
			columns: [table.categoryId],
			foreignColumns: [equipmentCategories.id],
		}).onDelete("cascade"),
	],
);

export const equipmentRentalsRelation = relations(
	equipmentRentals,
	({ one }) => ({
		category: one(equipmentCategories, {
			fields: [equipmentRentals.categoryId],
			references: [equipmentCategories.id],
		}),
	}),
);
