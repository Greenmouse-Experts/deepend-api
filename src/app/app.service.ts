import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class AppService {
	constructor(private readonly databaseService: DatabaseService) {}
	Home() {
		return { message: "Welcome to DeepEnd API" };
	}

	HomeV1() {
		return { message: "Welcome to DeepEnd API v1" };
	}

	getCountries(page = 1, limit = 10) {
		const offset = (page - 1) * limit;

		return this.databaseService.db.query.countries.findMany({
			limit: limit,
			offset: offset,
		});
	}
}
