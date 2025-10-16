import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DatabaseModule } from "src/database/database.module";
import { UserRepository } from "./user.repository";
import { JwtService } from "../jwt/jwt.service";

@Module({
	imports: [DatabaseModule],
	exports: [UserService, DatabaseModule],
	providers: [UserService, UserRepository, JwtService],
	controllers: [UserController],
})
export class UserModule {}
