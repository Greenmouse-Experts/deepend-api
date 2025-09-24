import {
	timestamp,
	boolean,
	mysqlTable,
	text,
	mysqlEnum,
	int,
} from "drizzle-orm/mysql-core";
import { countries } from "./countries";
import { varchar } from "drizzle-orm/mysql-core";
import { generateId } from "src/common/helpers";
import { ID_GENERATOR_LENGTH } from "src/common/constants";

export type CreateUser = typeof users.$inferInsert;

export const users = mysqlTable("users", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	email: varchar("email", { length: 254 }).notNull().unique(),
	password: text("password").notNull(),
	countryId: int("country_id")
		.notNull()
		.references(() => countries.id),
	phone: varchar("phone", { length: 20 }),
	address: text("address"),
	role: mysqlEnum("role", ["user", "admin", "moderator", "publisher"])
		.notNull()
		.default("user"),
	emailVerified: boolean("email_verified").default(false),
	refreshToken: text("refresh_token"),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});
