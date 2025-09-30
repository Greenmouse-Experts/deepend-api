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
