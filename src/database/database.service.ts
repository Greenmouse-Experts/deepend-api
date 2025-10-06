import {
	Inject,
	Injectable,
	Logger,
	OnApplicationShutdown,
	OnModuleInit,
} from "@nestjs/common";
import type { Connection } from "mysql2/promise";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
	private readonly logger = new Logger(DatabaseService.name);

	public db: MySql2Database<typeof schema>;

	constructor(@Inject("MYSQL_CONNECTION") private connection: Connection) {
		this.db = drizzle(this.connection, {
			schema: schema,
			mode: "default",
		});
	}

	async onModuleInit() {
		this.logger.log("Database module initialized");
		await this.checkConnection();
	}

	async checkConnection() {
		try {
			await this.connection.ping();
			this.logger.log("Database connection is healthy");
		} catch (error) {
			this.logger.error("Database connection failed", error);
			throw error;
		}
	}

	async onApplicationShutdown() {
		this.logger.log("Shutting down database connection");

		await this.connection.end();
	}
}
