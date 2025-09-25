import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { DrizzleQueryError } from "drizzle-orm";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger();

	catch(exception: HttpException | DrizzleQueryError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		// Handle unhandled database errors
		// if (exception instanceof DrizzleQueryError) {
		// console.error(exception);
		// const { status, message } = PgError.parsePgError(
		// 	exception.cause as DatabaseError,
		// );

		// 	return response.status(status).send({
		// 		status: "fail",
		// 		path: request.url,
		// 		message: message,
		// 		error_trace:
		// 			process.env.NODE_ENV === "development" ? exception.stack : undefined,
		// 	});
		// }

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		if (status === 500) {
			this.logger.error(
				`${request.method} ${request.url} ${status} - ${exception} ${request.ip}`,
			);
		}

		return response.status(status).send({
			status: "fail",
			path: request.url,
			message:
				status < 500
					? exception.message.replace(/"/g, "")
					: "An Error Occurred",
			error_trace:
				process.env.NODE_ENV === "development" ? exception.stack : undefined,
		});
	}
}
