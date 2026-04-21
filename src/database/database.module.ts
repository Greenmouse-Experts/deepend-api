import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { MYSQL_CONNECTION } from "src/common/constants";
import { ConfigService } from "@nestjs/config";
import mysql from "mysql2/promise";

@Module({
	exports: [DatabaseService],
	providers: [
		DatabaseService,
		{
			provide: MYSQL_CONNECTION,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const pool = mysql.createPool({
					host: configService.get<string>("DB_HOST"),
					port: configService.get<number>("DB_PORT"),
					user: configService.get<string>("DB_USER"),
					password: configService.get<string>("DB_PASSWORD"),
					database: configService.get<string>("DB_NAME"),
					waitForConnections: true,
					connectionLimit: 10,
					queueLimit: 0,
				});

				return pool;
			},
		},
	],
})
export class DatabaseModule {}
