import { Body, Controller, Param, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JoiValidationPipe } from "src/common/pipes/validation.pipe";
import { ChangePasswordDto, ChangePasswordSchema, CreateUserDto, CreateUserSchema, ForgotPasswordDto, ForgotPasswordSchema, LoginUserDto, LoginUserSchema, RefreshTokenDto, RefreshTokenSchema, ResendVerificationDto, ResendVerificationSchema, ResetPasswordDto, ResetPasswordSchema, VerifyEmailDto, VerifyEmailSchema } from "../user/dto/user";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/auth.guard";
import { GetUser } from "src/common/decorators/get-user.decorator";

@ApiTags("Authentication")
@Controller({ path: "auth", version: "1" })
export class AuthController {
	constructor(private readonly authService: AuthService) {}


  @Post('users/register')
  @UsePipes(new  JoiValidationPipe(CreateUserSchema))// Apply validation pipe
  @ApiOperation({ summary: 'Register a new user' })
  async registerUser(@Body() userData: CreateUserDto) {
    return await this.authService.registerUser(userData);
  }

  @Post('users/login')
  @UsePipes(new  JoiValidationPipe(LoginUserSchema))// Apply validation pipe 
  @ApiOperation({ summary: 'Login a user' })
  async loginUser(@Body() loginData: LoginUserDto) {
    return await this.authService.loginUser(loginData);
  }

  @Post('users/verify-email')
  @UsePipes(new  JoiValidationPipe(VerifyEmailSchema)) 
  @ApiOperation({ summary: 'Verify user email with OTP code' })
  async verifyEmail(@Body() verifyData: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyData.userId, verifyData.code);
  }

  @Post("users/resend-verification")
  @UsePipes(new  JoiValidationPipe(ResendVerificationSchema))
  @ApiOperation({ summary: 'Resend email verification code' })
  async resendVerification(@Body() body: ResendVerificationDto) {
    return await this.authService.resendVerificationCode(body.email);
  }

  @Post("users/forgot-password")
  @UsePipes(new  JoiValidationPipe(ForgotPasswordSchema))
  @ApiOperation({ summary: 'Initiate forgot password process' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @Post("users/reset-password/:userId")
  @UsePipes(new  JoiValidationPipe(ResetPasswordSchema))
  @ApiOperation({ summary: 'Reset user password using OTP code' })
  async resetPassword(
    @Param("userId") userId: string,
    @Body() { newPassword, code }: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword({ userId,code, newPassword });
  }

  @Post("users/change-password")
  @ApiOperation({ summary: 'Change user password' })
  @UseGuards(AuthGuard)
  async changePassword(
    @GetUser("userId") userId: string,
    @Body(new  JoiValidationPipe(ChangePasswordSchema)) { newPassword,currentPassword }: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(userId, {
      newPassword, currentPassword
    });
  }

  @Post("users/refresh-token")
  @UsePipes(new  JoiValidationPipe(RefreshTokenSchema))
  @ApiOperation({ summary: 'Refresh authentication token' })
  async refreshToken(@Body() body: RefreshTokenDto) {
    return await this.authService.refreshToken(body.userId);
  }

  @Put("users/logout")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Logout user and invalidate tokens' })
  async logoutUser(@GetUser("userId") userId: string){
    return await this.authService.logoutUser(userId)
  }

  @Post("admins/login")
  @UsePipes(new  JoiValidationPipe(LoginUserSchema))// Apply validation pipe 
  @ApiOperation({ summary: 'Login an admin' })
  async adminLogin(@Body() loginData: LoginUserDto) {
    return await this.authService.loginAdmin(loginData);
  }
}
