import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
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
	EquipmentPaginationQueryDto,
	FoodOrderPaginationQueryDto,
	FoodOrderPaginationQuerySchema,
	ItemTypeQueryDto,
	ItemTypeQuerySchema,
	StudioPaginationQueryDto,
	StudioSessionPaginationQueryDto,
	TicketPaginationQueryDto,
	TicketPaginationQuerySchema,
	UpdateCartItemQuantityBodyDto,
	UpdateCartItemQuantityBodySchema,
} from "src/common/dto/requestQuery.dto";
import { JoiValidationPipe } from "src/common/pipes/validation.pipe";

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
		{ page, limit, status }: StudioSessionPaginationQueryDto,
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
		{ page, limit, status }: EquipmentPaginationQueryDto,
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

	@Get("cart/item/:itemId")
	@ApiOperation({ summary: "Get details of specific item in user's cart" })
	async getUserCartItem(
		@GetUser("userId") userId: string,
		@Param("itemId") itemId: string,
		@Query(new QueryJoiValidationPipe(ItemTypeQuerySchema))
		query: ItemTypeQueryDto,
	) {
		return await this.userService.getUserCartItemDetails({
			userId,
			itemId,
			itemType: query.itemType,
		});
	}

	@Patch("cart/item/:itemId/quantity")
	@ApiOperation({ summary: "Update quantity of specific item in user's cart" })
	async updateUserCartItemQuantity(
		@GetUser("userId") userId: string,
		@Param("itemId") itemId: string,
		@Body(new JoiValidationPipe(UpdateCartItemQuantityBodySchema))
		body: UpdateCartItemQuantityBodyDto,
	) {
		return await this.userService.updateUserCartItemQuantity({
			userId,
			itemId,
			itemType: body.itemType,
			quantity: body.quantity,
		});
	}

	@Delete("cart")
	@ApiOperation({ summary: "Clear user's current cart" })
	async clearUserCart(@GetUser("userId") userId: string) {
		return await this.userService.clearUserCart(userId);
	}

	@Delete("cart/item/:itemId")
	@ApiOperation({ summary: "Remove specific item from user's cart" })
	@HttpCode(204)
	async removeItemFromUserCart(
		@GetUser("userId") userId: string,
		@Param("itemId") itemId: string,
		@Query(new QueryJoiValidationPipe(ItemTypeQuerySchema))
		query: ItemTypeQueryDto,
	) {
		return await this.userService.removeUserCartItem({
			userId,
			itemId,
			itemType: query.itemType,
		});
	}

	@Post("cart/checkout")
	@ApiOperation({ summary: "Checkout user's cart" })
	async checkoutUserCart(@GetUser("userId") userId: string) {
		return await this.userService.checkoutUserCart(userId);
	}
}
