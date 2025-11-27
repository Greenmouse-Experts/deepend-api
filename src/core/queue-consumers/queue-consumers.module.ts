import { Module } from "@nestjs/common";
import { WebhooksListener } from "./webhooks.listener";
import { WebhooksConsumer } from "./webhooks.consumer";
import { PaymentModule } from "../payment/payment.module";
import { BullModule } from "@nestjs/bullmq";
import { WEBHOOKS_QUEUE } from "src/common/constants";
import { UserModule } from "../user/user.module";
import { MailModule } from "src/mail/mail.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
	imports: [
		BullModule.registerQueue({
			name: WEBHOOKS_QUEUE,
		}),
		PaymentModule,
		UserModule,
		MailModule,
		NotificationModule,
	],
	providers: [WebhooksConsumer, WebhooksListener],
	exports: [BullModule],
})
export class QueueConsumersModule {}
