import { Injectable } from "@nestjs/common";
import { PaymentService } from "../payment/payment.service";

@Injectable()
export class CallbackService {
	constructor(private readonly paymentService: PaymentService) {}

	async handleCallbackEvent(query: any): Promise<string> {
		// Process the callback query parameters as needed
		const paymentReference = query.reference;

		const paymentDetails = await this.paymentService.verifyPayment(
			paymentReference as string,
		);

		return `${process.env.PAYMENT_STATUS_CALLBACK_URL}?status=${paymentDetails.data.status}&reference=${paymentReference}`;
	}
}
