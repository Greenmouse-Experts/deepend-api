import { Module } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { ServicesController } from "./services.controller";
import { ServicesRepository } from "./service.repository";
import { DatabaseModule } from "src/database/database.module";

@Module({
	imports: [DatabaseModule],
	controllers: [ServicesController],
	providers: [ServicesService, ServicesRepository],
})
export class ServicesModule {}
