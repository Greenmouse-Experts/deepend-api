import { Module } from "@nestjs/common";
import { PaymentModule } from "../payment/payment.module";
import { CallbackService } from "./callback.service";
import { CallbackController } from "./callback.controller";

@Module({
	imports: [PaymentModule],
	controllers: [CallbackController],
	providers: [CallbackService],
	// exports: [CallbackService],
})
export class CallbackModule {}
