import { Module } from "@nestjs/common";
import { AppController } from "./app/app.controller";
import { AppService } from "./app/app.service";
import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./app.envSchema";
import { DatabaseModule } from "./database/database.module";
import { CoreModule } from "./core/core.module";
import { BullModule } from "@nestjs/bullmq";
import { WEBHOOKS_QUEUE } from "./common/constants";

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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
