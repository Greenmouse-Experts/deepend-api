import {
	int,
	text,
	timestamp,
	varchar,
	mysqlTable,
} from "drizzle-orm/mysql-core";

export const foodCategories = mysqlTable("food_categories", {
	id: int("id").primaryKey().autoincrement(),
	name: varchar("name", { length: 255 }).notNull().unique(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$onUpdateFn(() => new Date()),
});
