import { Body, Controller, Param, Post, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JoiValidationPipe } from "src/common/pipes/validation.pipe";
import { CreateUserDto, CreateUserSchema, LoginUserDto, LoginUserSchema, RefreshTokenDto, RefreshTokenSchema, ResendVerificationDto, ResendVerificationSchema, VerifyEmailDto, VerifyEmailSchema } from "../user/dto/user";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller({ path: "auth", version: "1" })
export class AuthController {
	constructor(private readonly authService: AuthService) {}


  @Post('users/register')
  @UsePipes(new  JoiValidationPipe(CreateUserSchema))// Apply validation pipe
  async registerUser(@Body() userData: CreateUserDto) {
    return await this.authService.registerUser(userData);
  }

  @Post('users/login')
  @UsePipes(new  JoiValidationPipe(LoginUserSchema))// Apply validation pipe 
  async loginUser(@Body() loginData: LoginUserDto) {
    return await this.authService.loginUser(loginData);
  }

  @Post('users/verify-email')
  @UsePipes(new  JoiValidationPipe(VerifyEmailSchema)) 
  async verifyEmail(@Body() verifyData: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyData.userId, verifyData.code);
  }

  @Post("users/resend-verification")
  @UsePipes(new  JoiValidationPipe(ResendVerificationSchema))
  async resendVerification(@Body() body: ResendVerificationDto) {
    return await this.authService.resendVerificationCode(body.email);
  }

  @Post("users/refresh-token")
  @UsePipes(new  JoiValidationPipe(RefreshTokenSchema))
  async refreshToken(@Body() body: RefreshTokenDto) {
    return await this.authService.refreshToken(body.userId);
  }
}
