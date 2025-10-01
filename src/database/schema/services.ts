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
	foodAddonCategories,
	foodAddonsItems,
	foodCategories,
} from "./categories";
import { ID_GENERATOR_LENGTH } from "src/common/constants";
import { generateId } from "src/common/helpers";

import { relations } from "drizzle-orm";

export type CreateFood = typeof foods.$inferInsert;

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
	imageUrls: json("image_urls").$type<string[]>().default([]).notNull(),
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
