import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform,
} from "@nestjs/common";
import * as Joi from "joi";

@Injectable()
export class QueryJoiValidationPipe implements PipeTransform {
	constructor(private readonly schema: Joi.ObjectSchema) {}

	async transform(value: any, metadata: ArgumentMetadata) {
		if (metadata.type !== "query") {
			return value;
		}

		try {
			await this.schema.validateAsync(value, {
				abortEarly: false,
			});

			return value;
		} catch (error) {
			if (error instanceof Joi.ValidationError) {
				const errorMessages = error.details
					.map((detail) => detail.message.replace(/"/g, ""))
					.join(", ");
				throw new BadRequestException(`${errorMessages}`);
			}
			throw error;
		}
	}
}
