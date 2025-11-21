import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { ServicesModule } from "./services/services.module";
import { PaymentModule } from './payment/payment.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { QueueConsumersModule } from './queue-consumers/queue-consumers.module';
import { NotificationModule } from './notification/notification.module';

@Module({
	imports: [UserModule, AuthModule, AdminModule, ServicesModule, PaymentModule, WebhooksModule, QueueConsumersModule, NotificationModule],
})
export class CoreModule {}
