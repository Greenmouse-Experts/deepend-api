import {
	timestamp,
	boolean,
	mysqlTable,
	text,
	mysqlEnum,
	int,
	varchar,
	decimal,
	index,
} from "drizzle-orm/mysql-core";
import { countries } from "./countries";
import { generateId } from "../../common/helpers";
import { ID_GENERATOR_LENGTH } from "../../common/constants";

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
	fcmToken: text("fcm_token"),
	refreshToken: text("refresh_token"),
	deliveryAddress: varchar("delivery_address", { length: 512 }),
	deliveryLng: decimal("delivery_longitude", {
		precision: 10,
		scale: 2,
	}),
	deliveryLat: decimal("delivery_latitude", {
		precision: 10,
		scale: 2,
	}),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const notifications = mysqlTable(
	"notifications",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: varchar("user_id", { length: ID_GENERATOR_LENGTH })
			.notNull()
			.references(() => users.id),
		title: varchar("title", { length: 255 }).notNull(),
		message: text("message").notNull(),
		isRead: boolean("is_read").default(false).notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	},
	(table) => [index("user_id_index").on(table.userId)],
);
