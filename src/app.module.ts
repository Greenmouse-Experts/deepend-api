import { Module } from "@nestjs/common";
import { AppController } from "./app/app.controller";
import { AppService } from "./app/app.service";
import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./app.envSchema";
import { DatabaseModule } from "./database/database.module";
import { CoreModule } from "./core/core.module";

@Module({
	imports: [
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
