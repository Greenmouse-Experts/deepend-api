import { Module } from "@nestjs/common";
import { AppController } from "./app/app.controller";
import { AppService } from "./app/app.service";
import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./app.envSchema";
import { DatabaseModule } from "./database/database.module";
import { CoreModule } from "./core/core.module";
import { BullModule } from "@nestjs/bullmq";
import { WEBHOOKS_QUEUE } from "./common/constants";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import basicAuth from "express-basic-auth";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { StorageModule } from './storage/storage.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: envSchema,
		}),
		DatabaseModule,
		CoreModule,
		BullModule.registerQueue({
			name: WEBHOOKS_QUEUE,
		}),
		BullModule.forRoot({
			connection: {
				url: process.env.REDIS_QUEUE_URL,
			},
			defaultJobOptions: {
				removeOnComplete: {
					count: 50,
				},
			},
		}),
		BullBoardModule.forRoot({
			route: "/queues",
			adapter: ExpressAdapter,
			middleware: basicAuth({
				challenge: true,
				users: { admin: process.env.BULL_BOARD_ADMIN_PASSWORD as string },
			}),
		}),
		BullBoardModule.forFeature({
			name: WEBHOOKS_QUEUE,
			adapter: BullMQAdapter,
		}),
		StorageModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
