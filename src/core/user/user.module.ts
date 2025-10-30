import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DatabaseModule } from "src/database/database.module";
import { UserRepository } from "./user.repository";
import { JwtService } from "../jwt/jwt.service";
import { ServicesModule } from "../services/services.module";

@Module({
	imports: [forwardRef(() => ServicesModule), DatabaseModule],
	providers: [UserService, UserRepository, JwtService],
	controllers: [UserController],
	exports: [UserService, UserRepository, DatabaseModule],
})
export class UserModule {}
