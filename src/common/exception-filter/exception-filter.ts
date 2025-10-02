import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { DrizzleQueryError } from "drizzle-orm";
import { MySQLError } from "../mysql.error";
import { expression } from "joi";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger();

	private readonly excludedPayloadKeys = ["message", "error", "statusCode"];

	catch(exception: HttpException | DrizzleQueryError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		// Handle unhandled database errors
		if (exception instanceof DrizzleQueryError) {
			console.error(exception);
			const { status, message } = MySQLError.parseMySQLError(exception.cause);

			return response.status(status).send({
				status: "fail",
				path: request.url,
				message: message,
				error_trace:
					process.env.NODE_ENV === "development" ? exception.stack : undefined,
				error_cause:
					exception.cause instanceof Error &&
					process.env.NODE_ENV === "development"
						? exception.cause.message
						: undefined,
				exception:
					process.env.NODE_ENV === "development" ? exception : undefined,
			});
		}

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		if (status === 500) {
			this.logger.error(
				`${request.method} ${request.url} ${status} - ${exception} ${request.ip}`,
			);
		}

		let payload: Record<string, any> = {};
		const exceptionResponse =
			exception instanceof HttpException ? exception.getResponse() : null;

		if (
			exceptionResponse &&
			typeof exceptionResponse === "object" &&
			!Array.isArray(exceptionResponse)
		) {
			payload = Object.entries(exceptionResponse)
				.filter(([key]) => !this.excludedPayloadKeys.includes(key))
				.reduce(
					(acc, [key, value]) => {
						acc[key] = value;
						return acc;
					},
					{} as Record<string, any>,
				);
		}

		return response.status(status).send({
			status: "fail",
			path: request.url,
			message:
				status < 500
					? exception.message.replace(/"/g, "")
					: "An Error Occurred",
			...(Object.keys(payload).length > 0 ? { payload } : {}),
			error_trace:
				process.env.NODE_ENV === "development" ? exception.stack : undefined,
		});
	}
}
