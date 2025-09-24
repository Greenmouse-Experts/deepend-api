import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DatabaseModule } from "src/database/database.module";
import { UserRepository } from "./user.repository";

@Module({
	imports: [DatabaseModule],
	exports: [UserService, DatabaseModule],
	providers: [UserService, UserRepository],
	controllers: [UserController],
})
export class UserModule {}
