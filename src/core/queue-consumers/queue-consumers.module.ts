import { Module } from "@nestjs/common";
import { WebhooksListener } from "./webhooks.listener";
import { WebhooksConsumer } from "./webhooks.consumer";
import { PaymentModule } from "../payment/payment.module";

@Module({
	imports: [PaymentModule],
	providers: [WebhooksConsumer, WebhooksListener],
})
export class QueueConsumersModule {}
