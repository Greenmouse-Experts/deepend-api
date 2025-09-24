import {
	mysqlTable,
	int,
	text,
	varchar,
	timestamp,
} from "drizzle-orm/mysql-core";
import { users } from "./users";
import { ID_GENERATOR_LENGTH } from "src/common/constants";

export const verification = mysqlTable("verification", {
	id: int("id").autoincrement().primaryKey(),
	userId: varchar("user_id", { length: ID_GENERATOR_LENGTH })
		.notNull()
		.references(() => users.id),
	otpCode: text("otp_code").notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { fsp: 6 }).notNull(),
});
