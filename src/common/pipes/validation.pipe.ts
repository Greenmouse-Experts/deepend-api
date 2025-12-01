import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform,
} from "@nestjs/common";
import * as Joi from "joi";

@Injectable()
export class JoiValidationPipe implements PipeTransform {
	constructor(private readonly schema: Joi.ObjectSchema) {}

	async transform(value: any, metadata: ArgumentMetadata) {
		if (!value) {
			throw new BadRequestException("Request body is empty");
		}

		try {
			if (
				(value instanceof Object && metadata.type === "body") ||
				(typeof value === "object" && metadata.type === "body")
			) {
				console.log("Validating value:", value);
				console.log("JSON Body:", JSON.stringify(value, null, 2));

				await this.schema.validateAsync(value, {
					abortEarly: false,
				});

				return value;
			}

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
