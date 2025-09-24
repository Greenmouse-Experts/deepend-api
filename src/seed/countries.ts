import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { countries } from "../../src/database/schema/countries";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Infer insert type from schema (safe)
type NewCountry = typeof countries.$inferInsert;

async function loadCountries(): Promise<NewCountry[]> {
	const file = path.join(__dirname, "countries.json");
	const raw = fs.readFileSync(file, "utf-8");
	const data = JSON.parse(raw) as Array<{ code: string; name: string }>;

	return data.map((c) => ({
		code: c.code.toUpperCase(),
		name: c.name,
	}));
}

async function main() {
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		multipleStatements: true,
	});

	const db = drizzle(connection);

	console.log("Seeding countries...");

	const data = await loadCountries();

	if (!data.length) {
		console.log("No countries to insert. Exiting.");
		await connection.end();
		return;
	}

	// Idempotent approach:
	// Use ON DUPLICATE KEY UPDATE to update name if code already exists.
	// (If you prefer to skip existing rows, you can use INSERT IGNORE instead.)
	// Drizzle's .onDuplicateKeyUpdate for MySQL:
	await db
		.insert(countries)
		.values(data)
		.onDuplicateKeyUpdate({
			set: {
				name: sql`VALUES(name)`,
			},
		});

	const insertedCount = data.length;

	console.log(`Countries seed applied for ${insertedCount} entries.`);

	await connection.end();
	console.log("Done.");
}

main().catch((err) => {
	console.error("Country seeding failed:", err);
	process.exit(1);
});
