import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ServicesService } from "./services.service";
import { QueryJoiValidationPipe } from "src/common/pipes/query-validation.pipe";
import {
	CalculateEquipmentRentalPriceQueryDto,
	CalculateEquipmentRentalPriceQuerySchema,
	DateRangeQueryDto,
	DateRangeQuerySchema,
	GetBookedStudiosSessionsByRangeQueryDto,
	GetBookedStudiosSessionsByRangeQuerySchema,
	GetBookedStudiosSessionsQueryDto,
	GetBookedStudiosSessionsQuerySchema,
	HotelPaginationQueryDto,
	hotelPaginationQuerySchema,
	MoviePaginationQueryDto,
	MoviePaginationQuerySchema,
	MovieShowtimePaginationQueryDto,
	MovieShowtimePaginationQuerySchema,
	PaginationQueryDto,
	PaginationQuerySchema,
	ServicePaginationQueryDto,
	ServicePaginationQuerySchema,
	StudioPaginationQueryDto,
	StudioPaginationQuerySchema,
	TimeRangeQueryDto,
	TimeRangeQuerySchema,
} from "src/common/dto/requestQuery.dto";
import { ApiOperation } from "@nestjs/swagger";
import {
	BookEquipmentRentalDto,
	BookEquipmentRentalSchema,
	BookHotelDto,
	BookHotelSchema,
	BookStudioSessionDto,
	BookStudioSessionSchema,
	CreateFoodOrderDto,
	CreateFoodOrderSchema,
	CreateMovieTicketOrderDto,
	CreateVrGameTicketOrderDto,
	CreateVrGameTicketOrderSchema,
} from "../admin/dto/service.dto";
import { JoiValidationPipe } from "src/common/pipes/validation.pipe";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { Role } from "src/common/decorators/role/role.decorator";
import { UserRoles } from "src/common/decorators/role/role.enum";
import { AuthGuard } from "src/common/guards/auth.guard";

@Controller({ version: "1" })
export class ServicesController {
	constructor(private readonly servicesService: ServicesService) {}

	@Get("foods/categories")
	@ApiOperation({ summary: "Get food categories with pagination" })
	async getFoodCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.servicesService.getFoodCategories(page, limit);
	}

	@Get("foods/:id")
	@ApiOperation({ summary: "Get a food item by ID" })
	async getFoodById(@Param("id") id: string) {
		return await this.servicesService.getFoodById(id);
	}

	@Get("foods")
	@ApiOperation({
		summary: "Get all food items with pagination, filtering, and search",
	})
	async getAllFoods(
		@Query(new QueryJoiValidationPipe(ServicePaginationQuerySchema))
		{ page, limit, categoryId, search }: ServicePaginationQueryDto,
	) {
		return await this.servicesService.getAllFoods({
			page,
			limit,
			categoryId,
			search,
		});
	}

	@Get("advert-banners")
	@ApiOperation({ summary: "Get all advertisement banners" })
	async getAdvertBanners(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema)) {
			page,
			limit,
		}: PaginationQueryDto,
	) {
		return await this.servicesService.getAllAdvertBanners(page, limit);
	}

	@Get("vrgames")
	@ApiOperation({ summary: "Get all VR games with pagination" })
	async getAllVrGames(
		@Query(new QueryJoiValidationPipe(ServicePaginationQuerySchema))
		{ page, limit, categoryId, search }: ServicePaginationQueryDto,
	) {
		return await this.servicesService.getVrGames({
			page,
			limit,
			categoryId,
			search,
		});
	}

	@Get("vrgames/categories")
	@ApiOperation({ summary: "Get VR game categories with pagination" })
	async getVrGameCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.servicesService.getAllVrGameCategories(page, limit);
	}

	@Get("vrgames/:id")
	@ApiOperation({ summary: "Get a VR game by ID" })
	async getVrGameById(@Param("id") id: string) {
		return await this.servicesService.getVrGameById(id);
	}

	@Get("hotels/amenities")
	@ApiOperation({ summary: "Get all hotel amenities" })
	async getAllHotelAmenities(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.servicesService.getAllHotelAmenities(page, limit);
	}

	@Get("hotels/:id")
	@ApiOperation({ summary: "Get a hotel by ID" })
	async getHotelById(@Param("id") id: string) {
		return await this.servicesService.getHotelById(id);
	}

	@Get("hotels")
	@ApiOperation({
		summary: "Get all hotels with pagination, filtering, and search",
	})
	async getAllHotels(
		@Query(new QueryJoiValidationPipe(hotelPaginationQuerySchema))
		{
			page,
			limit,
			search,
			longitude,
			latitude,
			radius,
		}: HotelPaginationQueryDto,
	) {
		return await this.servicesService.getAllHotels({
			page,
			limit,
			search,
			coordinates: { lon: longitude, lat: latitude },
			radius,
		});
	}

	@Get("equipments/categories")
	@ApiOperation({ summary: "Get equipment categories with pagination" })
	async getEquipmentCategories(
		@Query(new QueryJoiValidationPipe(PaginationQuerySchema))
		{ page, limit }: PaginationQueryDto,
	) {
		return await this.servicesService.getEquipmentCategories(page, limit);
	}

	@Get("equipments/:id")
	@ApiOperation({ summary: "Get an equipment item by ID" })
	async getEquipmentRentalById(@Param("id") id: string) {
		return await this.servicesService.getEquipmentRentalById(id);
	}

	@Get("equipments")
	@ApiOperation({
		summary:
			"Get all equipment rental items with pagination, filtering, and search",
	})
	async getAllEquipmentRentals(
		@Query(new QueryJoiValidationPipe(ServicePaginationQuerySchema))
		{ page, limit, categoryId, search }: ServicePaginationQueryDto,
	) {
		return await this.servicesService.getAllEquipmentRentals({
			page,
			limit,
			categoryId,
			search,
		});
	}

	@Get("movies/upcoming")
	@ApiOperation({ summary: "Get all upcoming movie" })
	async getUpcomingMovieShowtimes(
		@Query(new QueryJoiValidationPipe(MoviePaginationQuerySchema))
		{ page, limit, search, genreId }: MoviePaginationQueryDto,
	) {
		return await this.servicesService.getUpcomingMovies({
			page,
			limit,
			search,
			genreId,
		});
	}

	@Get("movies/showtimes")
	@ApiOperation({ summary: "Get all movies by showtime" })
	async getTodayMovieShowtimes(
		@Query(new QueryJoiValidationPipe(MovieShowtimePaginationQuerySchema))
		{ page, limit, date, search, genreId }: MovieShowtimePaginationQueryDto,
	) {
		return await this.servicesService.getMoviesByShowtime({
			currentDate: date,
			page,
			limit,
			search,
			genreId,
		});
	}

	@Get("studios")
	@ApiOperation({ summary: "Get all studios" })
	async getAllStudios(
		@Query(new QueryJoiValidationPipe(StudioPaginationQuerySchema))
		{ page, limit, search }: StudioPaginationQueryDto,
	) {
		return await this.servicesService.getAllStudios({
			page,
			limit,
			search,
		});
	}

	@Get("studios/:studioId/availability")
	@ApiOperation({ summary: "Get studio availability" })
	async getStudioAvailability(
		@Param("studioId", ParseIntPipe) studioId: number,
	) {
		return await this.servicesService.getStudioAvailabilityByStudioId(studioId);
	}

	@Get("studios/:studioId/booked-sessions")
	@ApiOperation({ summary: "Get booked sessions for a studio" })
	async getBookedStudioSessions(
		@Param("studioId", ParseIntPipe) studioId: number,
		@Query(new QueryJoiValidationPipe(GetBookedStudiosSessionsQuerySchema))
		query: GetBookedStudiosSessionsQueryDto,
	) {
		return await this.servicesService.getBookedStudioSessionsByDate(
			studioId,
			query.date,
		);
	}

	@Get("studios/:studioId/booked-sessions/range")
	@ApiOperation({
		summary: "Get booked sessions for a studio within a date range",
	})
	async getBookedStudioSessionsByRange(
		@Param("studioId", ParseIntPipe) studioId: number,
		@Query(
			new QueryJoiValidationPipe(GetBookedStudiosSessionsByRangeQuerySchema),
		)
		query: GetBookedStudiosSessionsByRangeQueryDto,
	) {
		return await this.servicesService.getBookedStudioSessionsByDateRange(
			studioId,
			query.startDate,
			query.endDate,
		);
	}

	@Get("studios/:studioId/booking-price")
	@ApiOperation({ summary: "Calculate total price for studio booking" })
	async getStudioBookingPrice(
		@Param("studioId", ParseIntPipe) studioId: number,
		@Query(new QueryJoiValidationPipe(TimeRangeQuerySchema))
		query: TimeRangeQueryDto,
	) {
		return await this.servicesService.getStudioTotalPrice(
			studioId,
			query.startTime,
			query.endTime,
		);
	}

	@Post("studios/book")
	@ApiOperation({ summary: "Book a studio session" })
	@UseGuards(AuthGuard)
	@Role(UserRoles.User)
	async bookStudioSession(
		@GetUser("userId") userId: string,
		@Body(new JoiValidationPipe(BookStudioSessionSchema))
		body: BookStudioSessionDto,
	) {
		return await this.servicesService.bookStudioSession(userId, body);
	}

	@Get("equipments/:equipmentId/booking-price")
	@ApiOperation({ summary: "Calculate total price for equipment rental" })
	async getEquipmentRentalBookingPrice(
		@Param("equipmentId") equipmentId: string,
		@Query(new QueryJoiValidationPipe(CalculateEquipmentRentalPriceQuerySchema))
		query: CalculateEquipmentRentalPriceQueryDto,
	) {
		return await this.servicesService.getEquipmentRentalTotalPrice(
			equipmentId,
			query.startDate,
			query.endDate,
			query.quantity,
		);
	}

	@Post("equipments/book")
	@ApiOperation({ summary: "Book equipment rental" })
	@UseGuards(AuthGuard)
	@Role(UserRoles.User)
	async bookEquipmentRental(
		@GetUser("userId") userId: string,
		@Body(new JoiValidationPipe(BookEquipmentRentalSchema))
		body: BookEquipmentRentalDto,
	) {
		return await this.servicesService.bookEquipmentRental(userId, body);
	}

	@Get("vrgames/:vrgameId/availability")
	@ApiOperation({ summary: "Get VR game availability" })
	async getVrGameAvailability(@Param("vrgameId") vrgameId: string) {
		return await this.servicesService.getVrgameAvailabilityByVrgameId(vrgameId);
	}

	@Post("vrgames/book")
	@ApiOperation({ summary: "Book a VR game session" })
	@UseGuards(AuthGuard)
	@Role(UserRoles.User)
	async bookVrGameSession(
		@GetUser("userId") userId: string,
		@Body(new JoiValidationPipe(CreateVrGameTicketOrderSchema))
		body: CreateVrGameTicketOrderDto,
	) {
		return await this.servicesService.createVrgamesPurchaseOrder(userId, body);
	}

	@Post("movies/book")
	@ApiOperation({ summary: "Book movie tickets" })
	@UseGuards(AuthGuard)
	@Role(UserRoles.User)
	async bookMovieTickets(
		@GetUser("userId") userId: string,
		@Body() body: CreateMovieTicketOrderDto,
	) {
		return await this.servicesService.createMovieTicketOrder(userId, body);
	}

	@Post("hotels/book")
	@ApiOperation({ summary: "Book hotel rooms" })
	@UseGuards(AuthGuard)
	@Role(UserRoles.User)
	async bookHotelRooms(
		@GetUser("userId") userId: string,
		@Body(new JoiValidationPipe(BookHotelSchema)) body: BookHotelDto,
	) {
		return await this.servicesService.createHotelBooking(userId, body);
	}

	@Post("foods/order")
	@ApiOperation({ summary: "Order food items" })
	@UseGuards(AuthGuard)
	@Role(UserRoles.User)
	async orderFoodItems(
		@GetUser("userId") userId: string,
		@Body(new JoiValidationPipe(CreateFoodOrderSchema))
		body: CreateFoodOrderDto,
	) {
		return await this.servicesService.createFoodOrder(userId, body);
	}
}
