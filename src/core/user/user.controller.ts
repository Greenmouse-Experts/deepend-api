import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { Role } from "src/common/decorators/role/role.decorator";
import { UserRoles } from "src/common/decorators/role/role.enum";
import { QueryJoiValidationPipe } from "src/common/pipes/query-validation.pipe";
import { UserService } from "./user.service";
import { AuthGuard } from "src/common/guards/auth.guard";
import {
	BookingPaginationQueryDto,
	BookingPaginationQuerySchema,
	FoodOrderPaginationQueryDto,
	FoodOrderPaginationQuerySchema,
	TicketPaginationQueryDto,
	TicketPaginationQuerySchema,
} from "src/common/dto/requestQuery.dto";

@Controller({ path: "users", version: "1" })
@UseGuards(AuthGuard)
@Role(UserRoles.User)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("studios/bookings")
	@ApiOperation({ summary: "Get user's studio bookings with pagination" })
	async getUserStudioBookings(
		@GetUser("id") userId: string,
		@Query(new QueryJoiValidationPipe(BookingPaginationQuerySchema))
		{ page, limit, status }: BookingPaginationQueryDto,
	) {
		return await this.userService.getUserStudioBookings({
			userId,
			page,
			limit,
			status,
		});
	}

	@Get("equipment-rentals/bookings")
	@ApiOperation({
		summary: "Get user's equipment rental bookings with pagination",
	})
	async getUserEquipmentRentalBookings(
		@GetUser("userId") userId: string,
		@Query(new QueryJoiValidationPipe(BookingPaginationQuerySchema))
		{ page, limit, status }: BookingPaginationQueryDto,
	) {
		return await this.userService.getUserEquipmentRentalBookings({
			userId,
			page,
			limit,
			status,
		});
	}

	@Get("vrgames/purchases")
	@ApiOperation({
		summary: "Get user's VR game purchases with pagination",
	})
	async getUserVRGamePurchases(
		@GetUser("userId") userId: string,
		@Query(new QueryJoiValidationPipe(TicketPaginationQuerySchema))
		{ page, limit, status }: TicketPaginationQueryDto,
	) {
		return await this.userService.getUserVrgamesTicketPurchases({
			userId,
			page,
			limit,
			status,
		});
	}

	@Get("movies/purchases")
	@ApiOperation({
		summary: "Get user's movie purchases with pagination",
	})
	async getUserMoviePurchases(
		@GetUser("userId") userId: string,
		@Query(new QueryJoiValidationPipe(TicketPaginationQuerySchema))
		{ page, limit, status }: TicketPaginationQueryDto,
	) {
		return await this.userService.getUserMovieTicketPurchases({
			userId,
			page,
			limit,
			status,
		});
	}

	@Get("hotels/bookings")
	@ApiOperation({ summary: "Get user's hotel bookings with pagination" })
	async getUserHotelBookings(
		@GetUser("userId") userId: string,
		@Query(new QueryJoiValidationPipe(BookingPaginationQuerySchema))
		{ page, limit, status }: BookingPaginationQueryDto,
	) {
		return await this.userService.getUserHotelBookings({
			userId,
			page,
			limit,
			status,
		});
	}

	@Get("foods/orders")
	@ApiOperation({ summary: "Get user's food orders with pagination" })
	async getUserFoodOrders(
		@GetUser("userId") userId: string,
		@Query(new QueryJoiValidationPipe(FoodOrderPaginationQuerySchema))
		{ page, limit, status }: FoodOrderPaginationQueryDto,
	) {
		return await this.userService.getUserFoodOrders({
			userId,
			page,
			limit,
			status,
		});
	}

	@Get("cart")
	@ApiOperation({ summary: "Get user's current cart" })
	async getUserCart(@GetUser("userId") userId: string) {
		return await this.userService.getUserCart(userId);
	}
}
