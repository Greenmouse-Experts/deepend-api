import { Module } from "@nestjs/common";
import { AppController } from "./app/app.controller";
import { AppService } from "./app/app.service";
import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./app.envSchema";
import { DatabaseModule } from "./database/database.module";
import { CoreModule } from "./core/core.module";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file"; // Import for file rotation

@Module({
	imports: [
		WinstonModule.forRoot({
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
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: envSchema,
		}),
		DatabaseModule,
		CoreModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
