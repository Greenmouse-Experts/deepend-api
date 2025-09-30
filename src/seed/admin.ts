import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
// import { seed } from "drizzle-seed";
import argon2 from "@node-rs/argon2";
import { users } from "../database/schema/users";

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

	console.log("Seeding admins...");
	const passwordHash1 = await argon2.hash("Admin1234");

	const passwordHash2 = await argon2.hash("Admin5678");

	await db.insert(users).values([
		{
			firstName: "Admin",
			lastName: "One",
			email: "greenmousedev+13@gmail.com",
			password: passwordHash1,
			countryId: 1,
			phone: "1234567890",
			address: "123 Admin St, City, Country",
			emailVerified: true,
			role: "admin",
		},
		{
			firstName: "Admin",
			lastName: "Two",
			email: "greenmousedev+23@gmail.com",
			password: passwordHash2,
			countryId: 2,
			phone: "0987654321",
			address: "456 Admin Ave, City, Country",
			emailVerified: true,
			role: "admin",
		},
	]);

	// await seed(
	// 	db,
	// 	{
	// 		users,
	// 	},
	// 	{ count: 2 },
	// ).refine((f) => ({
	// 	users: {
	// 		columns: {
	// 			lastName: f.lastName(),
	// 			firstName: f.firstName(),
	// 			email: f.email(),
	// 			password: f.valuesFromArray({
	// 				values: ["Admin1234", "Admin5678"],
	// 			}),
	// 			countryId: f.valuesFromArray({
	// 				values: [1, 2, 3, 4, 5, 6],
	// 			}),
	// 			phone: f.phoneNumber(),
	// 			address: f.streetAddress(),
	// 			emailVerified: f.default({ defaultValue: true }),
	// 			role: f.default({ defaultValue: "admin" }),
	// 		},
	// 	},
	// }));

	console.log("Seeding completed.");
	return;
}

main();
