import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminRepository } from "./admin.repository";
import { AdminService } from "./admin.service";
import { DatabaseModule } from "src/database/database.module";
import { JwtService } from "../jwt/jwt.service";

@Module({
	imports: [DatabaseModule],
	controllers: [AdminController],
	providers: [AdminRepository, AdminService, JwtService],
})
export class AdminModule {}
