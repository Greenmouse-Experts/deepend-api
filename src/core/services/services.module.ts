import { Module } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { ServicesController } from "./services.controller";
import { ServicesRepository } from "./service.repository";
import { DatabaseModule } from "src/database/database.module";
import { JwtService } from "../jwt/jwt.service";

@Module({
	imports: [DatabaseModule],
	controllers: [ServicesController],
	providers: [ServicesService, ServicesRepository, JwtService],
})
export class ServicesModule {}
