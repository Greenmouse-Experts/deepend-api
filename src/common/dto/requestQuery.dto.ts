import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";

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
