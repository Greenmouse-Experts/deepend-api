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
