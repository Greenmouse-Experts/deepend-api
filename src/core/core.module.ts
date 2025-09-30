import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";

@Module({
	imports: [UserModule, AuthModule, AdminModule],
})
export class CoreModule {}
