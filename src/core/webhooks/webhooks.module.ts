import { Module } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { WebhooksController } from "./webhooks.controller";
import { QueueConsumersModule } from "../queue-consumers/queue-consumers.module";

@Module({
	imports: [QueueConsumersModule],
	providers: [WebhooksService],
	controllers: [WebhooksController],
})
export class WebhooksModule {}
