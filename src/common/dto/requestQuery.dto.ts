import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";
import { timeToMinutes } from "../helpers";
import { timePattern } from "src/core/admin/dto/service.dto";
import { isBefore } from "date-fns";

export class PaginationQueryDto {
	@ApiProperty({
		example: 1,
		description: "Page number",
		required: false,
	})
	page: number;

	@ApiProperty({
		example: 10,
		description: "Number of items per page",
		required: false,
	})
	limit: number;
}

export const PaginationQuerySchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(100).default(10),
});

export class ServicePaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: 1,
		description: "Category ID to filter foods",
		required: false,
	})
	categoryId?: number;

	@ApiProperty({
		example: "pizza",
		description: "Search term to filter foods by name or description",
		required: false,
	})
	search?: string;
}

export const ServicePaginationQuerySchema = PaginationQuerySchema.keys({
	categoryId: Joi.number().integer().min(1).optional(),
	search: Joi.string().max(100).optional(),
});

export class HotelPaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "Hilton",
		description: "Search term to filter hotels by name or description",
		required: false,
	})
	search?: string;

	@ApiProperty({
		example: 103.8198,
		description: "Longitude to filter hotels by proximity",
		required: false,
	})
	longitude?: number;

	@ApiProperty({
		example: 1.3521,
		description: "Latitude to filter hotels by proximity",
		required: false,
	})
	latitude?: number;

	@ApiProperty({
		example: 5,
		description: "Radius in kilometers to filter hotels by proximity",
		required: false,
	})
	radius?: number;
}

export const hotelPaginationQuerySchema = PaginationQuerySchema.keys({
	longitude: Joi.number().min(-180).max(180).optional(),
	latitude: Joi.number().min(-90).max(90).optional(),
	radius: Joi.number().min(1).max(100).optional(),
	search: Joi.string().max(100).optional(),
}).and("longitude", "latitude", "radius");

export class MoviePaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "Inception",
		description: "Search term to filter movies by title or description",
		required: false,
	})
	search?: string;

	@ApiProperty({
		example: 1,
		description: "Genre ID to filter movies",
		required: false,
	})
	genreId: number;
}

export const MoviePaginationQuerySchema = PaginationQuerySchema.keys({
	search: Joi.string().max(100).optional(),
	genreId: Joi.number().integer().min(1).optional(),
});

export class MovieShowtimePaginationQueryDto extends MoviePaginationQueryDto {
	@ApiProperty({
		example: "2023-10-01",
		description: "Date to filter showtimes (YYYY-MM-DD)",
		required: false,
	})
	date: string;
}

export const MovieShowtimePaginationQuerySchema =
	MoviePaginationQuerySchema.keys({
		date: Joi.date().iso().required(),
	});

export class StudioPaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "yoga",
		description: "Search term to filter studios by name or description",
		required: false,
	})
	search?: string;
}

export const StudioPaginationQuerySchema = PaginationQuerySchema.keys({
	search: Joi.string().max(100).optional(),
});

export class GetBookedStudiosSessionsQueryDto {
	@ApiProperty({
		example: "2023-10-01",
		description: "Date to filter booked sessions (YYYY-MM-DD)",
		required: true,
	})
	date: string;
}

export const GetBookedStudiosSessionsQuerySchema = Joi.object({
	date: Joi.date().iso().required(),
});

export class GetBookedStudiosSessionsByRangeQueryDto {
	@ApiProperty({
		example: "2023-10-01",
		description: "Start date to filter booked sessions (YYYY-MM-DD)",
		required: true,
	})
	startDate: string;

	@ApiProperty({
		example: "2023-10-07",
		description: "End date to filter booked sessions (YYYY-MM-DD)",
		required: true,
	})
	endDate: string;
}

export const GetBookedStudiosSessionsByRangeQuerySchema = Joi.object({
	startDate: Joi.date().iso().required(),
	endDate: Joi.date().iso().required(),
});

export class TimeRangeQueryDto {
	@ApiProperty({
		example: "09:00",
		description: "Start time in HH:mm format",
		required: true,
	})
	startTime: string;

	@ApiProperty({
		example: "17:00",
		description: "End time in HH:mm format",
		required: true,
	})
	endTime: string;
}

export const TimeRangeQuerySchema = Joi.object({
	startTime: Joi.string().pattern(timePattern).required(),
	endTime: Joi.string().pattern(timePattern).required(),
})
	.and("startTime", "endTime")
	.custom((value, helpers) => {
		const { startTime, endTime } = value;

		if (startTime && endTime) {
			if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
				return helpers.error("time.endBeforeStart");
			}
		}

		return value;
	})
	.messages({
		"string.pattern.base": '"{#label}" must be in HH:mm format',
	});

export class DateRangeQueryDto {
	@ApiProperty({
		example: "2023-10-01",
		description: "Start date in YYYY-MM-DD format",
		required: true,
	})
	startDate: string;

	@ApiProperty({
		example: "2023-10-07",
		description: "End date in YYYY-MM-DD format",
		required: true,
	})
	endDate: string;
}

export const DateRangeQuerySchema = Joi.object({
	startDate: Joi.date().iso().required(),
	endDate: Joi.date().iso().required(),
})
	.and("startDate", "endDate")
	.custom((value, helpers) => {
		const { startDate, endDate } = value;

		if (startDate && endDate) {
			if (isBefore(new Date(endDate), new Date(startDate))) {
				return helpers.error("date.endBeforeStart");
			}
		}

		return value;
	})
	.messages({
		"date.format": '"{#label}" must be in YYYY-MM-DD format',
		"date.endBeforeStart":
			'"End date" must be greater than or equal to "Start date"',
	});

export class CalculateEquipmentRentalPriceQueryDto extends DateRangeQueryDto {
	@ApiProperty({
		example: 2,
		description: "Quantity of equipment to rent",
		required: true,
	})
	quantity: number;
}

export const CalculateEquipmentRentalPriceQuerySchema =
	DateRangeQuerySchema.keys({
		quantity: Joi.number().integer().min(1).required(),
	});

export class EquipmentPaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "ongoing",
		description:
			'Filter equipment rentals by status ("ongoing", "completed", "cancelled")',
		required: false,
	})
	status?: "ongoing" | "completed" | "cancelled";
}

export const EquipmentPaginationQuerySchema = PaginationQuerySchema.keys({
	status: Joi.string().valid("ongoing", "completed", "cancelled").optional(),
});

export class StudioSessionPaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "confirmed",
		description:
			'Filter studio sessions by status ("scheduled", "completed", "cancelled")',
		required: false,
	})
	status?: "scheduled" | "completed" | "cancelled";
}

export const StudioSessionPaginationQuerySchema = PaginationQuerySchema.keys({
	status: Joi.string().valid("scheduled", "completed", "cancelled").optional(),
});

export class BookingPaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "confirmed",
		description:
			'Filter bookings by status ("pending", "confirmed", "cancelled", "completed")',
		required: false,
	})
	status?: "confirmed" | "cancelled" | "completed";
}

export const BookingPaginationQuerySchema = PaginationQuerySchema.keys({
	status: Joi.string().valid("confirmed", "cancelled", "completed").optional(),
});

export class TicketPaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "completed",
		description: 'Filter tickets by status ("completed", "cancelled")',
		required: false,
	})
	status?: "completed" | "cancelled";
}

export const TicketPaginationQuerySchema = PaginationQuerySchema.keys({
	status: Joi.string().valid("completed", "cancelled").optional(),
});

export class UserPaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "john.doe",
		description: "Search term to filter users by username or email",
		required: false,
	})
	search?: string;
}

export const UserPaginationQuerySchema = PaginationQuerySchema.keys({
	search: Joi.string().max(100).optional(),
});

export class FoodOrderPaginationQueryDto extends PaginationQueryDto {
	@ApiProperty({
		example: "completed",
		description:
			'Filter food orders by status ("preparing", "delivered", "cancelled")',
		required: false,
	})
	status?: "preparing" | "delivered" | "cancelled" | "confirmed" | "on-the-way";
}

export const FoodOrderPaginationQuerySchema = PaginationQuerySchema.keys({
	status: Joi.string()
		.valid("preparing", "delivered", "cancelled", "confirmed", "on-the-way")
		.optional(),
});

export class ItemTypeQueryDto {
	@ApiProperty({
		example: "food",
		description: 'Type of item ("food", "movie", "vrgame")',
		required: true,
	})
	itemType: "food" | "movie" | "vrgame" | "studio" | "equipment" | "hotel";
}

export const ItemTypeQuerySchema = Joi.object({
	itemType: Joi.string()
		.valid("food", "movie", "vrgame", "studio", "equipment", "hotel")
		.required(),
});

export class UpdateCartItemQuantityBodyDto {
	@ApiProperty({
		example: 3,
		description: "New quantity for the cart item",
		required: true,
	})
	quantity: number;

	@ApiProperty({
		example: "food",
		description: 'Type of item ("food", "movie", "vrgame", "equipment")',
		required: true,
	})
	itemType: "food" | "movie" | "vrgame" | "equipment";
}

export const UpdateCartItemQuantityBodySchema = Joi.object({
	quantity: Joi.number().integer().min(1).required(),
	itemType: Joi.string()
		.valid("food", "movie", "vrgame", "equipment")
		.required(),
});

export class TicketTypeQueryDto {
	@ApiProperty({
		example: "movie",
		description: 'Type of ticket ("movie", "vrgame", "studio")',
		required: true,
	})
	ticketType: "movie" | "vrgame" | "studio";
}

export const TicketTypeQuerySchema = Joi.object({
	ticketType: Joi.string().valid("movie", "vrgame", "studio").required(),
});

export class ReceiptTypeQueryDto {
	@ApiProperty({
		example: "food",
		description:
			'Type of receipt ("food", "movie", "vrgame", "studio", "equipment", "hotel")',
		required: true,
	})
	receiptType: "food" | "studio" | "equipment" | "hotel";
}

export const ReceiptTypeQuerySchema = Joi.object({
	receiptType: Joi.string()
		.valid("food", "studio", "equipment", "hotel")
		.required(),
});

export class YearQueryDto {
	@ApiProperty({
		example: 2023,
		description: "Year to filter data",
		required: true,
	})
	year: number;
}

export const YearQuerySchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required(),
});
