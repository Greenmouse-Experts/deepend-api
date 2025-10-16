import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { Role } from "src/common/decorators/role/role.decorator";
import { UserRoles } from "src/common/decorators/role/role.enum";
import {
	StudioBookingPaginationQueryDto,
	StudioBookingPaginationQuerySchema,
} from "src/common/dto/requestQuery.dto";
import { QueryJoiValidationPipe } from "src/common/pipes/query-validation.pipe";
import { UserService } from "./user.service";
import { AuthGuard } from "src/common/guards/auth.guard";

@Controller({ path: "users", version: "1" })
@UseGuards(AuthGuard)
@Role(UserRoles.User)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("studio-bookings")
	@ApiOperation({ summary: "Get user's studio bookings with pagination" })
	async getUserStudioBookings(
		@GetUser("id") userId: string,
		@Query(new QueryJoiValidationPipe(StudioBookingPaginationQuerySchema))
		{ page, limit, status }: StudioBookingPaginationQueryDto,
	) {
		return await this.userService.getUserStudioBookings({
			userId,
			page,
			limit,
			status,
		});
	}
}
