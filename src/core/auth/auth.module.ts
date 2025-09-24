import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MailModule } from "src/mail/mail.module";
import { UserModule } from "../user/user.module";
import { VerificationService } from "../verification/verification.service";
import { PasswordService } from "../password/password.service";
import { JwtService } from "../jwt/jwt.service";

@Module({
	imports: [MailModule, UserModule],
	providers: [AuthService, JwtService, PasswordService, VerificationService],
	controllers: [AuthController],
})
export class AuthModule {}
