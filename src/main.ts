import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { CustomExceptionFilter } from "./common/exception-filter/exception-filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { requestLogger } from "./common/logger/request.logger";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file"; // Import for file rotation

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: WinstonModule.createLogger({
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.timestamp(),
						winston.format.ms(),
						winston.format.colorize(),
						winston.format.printf(
							(info) =>
								`${info.timestamp} ${info.level}: ${info.message} ${info.ms}`,
						),
					),
				}),
				new winston.transports.DailyRotateFile({
					filename: "application-%DATE%.log",
					datePattern: "YYYY-MM-DD",
					zippedArchive: true,
					maxSize: "20m",
					maxFiles: "14d",
					format: winston.format.combine(
						winston.format.timestamp(),
						winston.format.json(),
					),
				}),
			],
		}),
	});

	app.setGlobalPrefix("api");

	//For versioning api
	app.enableVersioning({
		type: VersioningType.URI,
	});

	//Apply Request Logger Middleware
	app.use(requestLogger({ skipHealth: true }));

	//Apply Response Interceptor
	app.useGlobalInterceptors(new ResponseInterceptor());

	//Apply exception filter
	app.useGlobalFilters(new CustomExceptionFilter());

	//swagger configurations
	const config = new DocumentBuilder()
		.setTitle("DeepEnd")
		.setDescription("DeepEnd Api")
		.setVersion("v1")
		.addServer("http://localhost:3000", "Local Environment")
		.addTag("Deep End Apis")
		.addBearerAuth(
			{ type: "http", scheme: "bearer", bearerFormat: "JWT" },
			"access-token",
		)
		.addBearerAuth(
			{ type: "http", scheme: "bearer", bearerFormat: "JWT" },
			"refresh-token",
		)
		.build();

	if (process.env.NODE_ENV !== "production") {
		//Swagger Document
		const document = SwaggerModule.createDocument(app, config);

		SwaggerModule.setup("api", app, document, {
			swaggerOptions: {
				persistAuthorization: true,
			},
			jsonDocumentUrl: "api-json",
		});
	}

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
