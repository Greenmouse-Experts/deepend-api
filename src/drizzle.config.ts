import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { join } from "path";

export default defineConfig({
	out: join(__dirname, "database", "migrations"),
	schema: "./src/database/schema/*.ts",
	dialect: "mysql",
	dbCredentials: {
		host: process.env.DB_HOST!,
		port: parseInt(process.env.DB_PORT!) || 3306,
		user: process.env.DB_USER!,
		password: process.env.DB_PASSWORD!,
		database:
			process.env.NODE_ENV === "production"
				? process.env.PROD_DB_NAME!
				: process.env.DB_NAME!,
	},
});
