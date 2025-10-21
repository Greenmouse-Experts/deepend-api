import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { CustomExceptionFilter } from "./common/exception-filter/exception-filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { requestLogger } from "./common/logger/request.logger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ["debug", "log", "warn", "error", "verbose"],
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

	app.enableCors({
		origin: [
			"http://localhost:3000",
			"http://localhost:5173",
			"https://localhost:5173",
			"https://localhost:3000",
			"https://deepend-admin.netlify.app",
		],
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		credentials: true,
	});

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
