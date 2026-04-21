import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller({version: "1"})
export class AppController {
	constructor(private readonly appService: AppService) {}


	@Get()
	HomeV1() {
		return this.appService.HomeV1();
	}
//added something
	@Get("countries")
	async getCountries(@Query("page") page = 1, @Query("limit") limit = 10) {
		return await this.appService.getCountries(page, limit);
	}
}
