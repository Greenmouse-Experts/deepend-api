import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
// import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { JwtService } from "src/core/jwt/jwt.service";
import { ROLES_KEY } from "../decorators/role/role.decorator";
import { UserRoles } from "../decorators/role/role.enum";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private reflector: Reflector,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		// const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
		// 	context.getHandler(),
		// 	context.getClass(),
		// ]);

		// if (skipAuth) {
		// 	return true;
		// }

		// Get request object
		const request = context.switchToHttp().getRequest<Request>();

		// authenticate user first
		await this.authenticateUser(request);

		// then authorize user
		return this.authorizeUser(context, request);
	}

	private extractTokenFromHeader(req: Request): string | undefined {
		const authHeader = req.headers.authorization;

		//If no auth header
		if (!authHeader) return undefined;

		const [authType, token] = authHeader.split(" ");

		return authType === "Bearer" ? token : undefined;
	}

	private async authenticateUser(request: Request) {
		//Extract token from header
		const token = this.extractTokenFromHeader(request);

		// if no token from auth header
		if (!token) throw new UnauthorizedException("User Unauthorized");

		try {
			const payload = await this.jwtService.verifyAccessToken(token);

			//@ts-ignore
			request["user"] = payload;

			return true;
		} catch (err) {
			if (err instanceof TokenExpiredError)
				throw new UnauthorizedException("Token Expired");

			if (err instanceof JsonWebTokenError)
				throw new UnauthorizedException("Invalid Token");

			throw err;
		}
	}

	private authorizeUser(context: ExecutionContext, request: Request) {
		const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		/// If no specific role is required, authorize user
		if (!requiredRoles || requiredRoles.length === 0) return true;

		//console.log(`Required roles ${requiredRoles}`);

		//@ts-ignore
		const user = request["user"];

		// if user is not authenticated
		if (!user) return false;

		return requiredRoles.some((role: string) => user.role === role);
	}
}
