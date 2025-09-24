import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

export type CreateCountry = typeof countries.$inferInsert;

export const countries = mysqlTable("countries", {
	id: int("id").autoincrement().primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	code: varchar("code", { length: 3 }).notNull().unique(),
});
