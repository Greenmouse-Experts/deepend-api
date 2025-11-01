import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
	SUCCESSFUL_PAYMENT_WEBHOOK,
	WEBHOOKS_QUEUE,
} from "src/common/constants";
import * as crypto from "node:crypto";

@Injectable()
export class WebhooksService {
	private readonly paystackSecret: string = process.env
		.PAYSTACK_SECRET_KEY as string;

	constructor(@InjectQueue(WEBHOOKS_QUEUE) private webhookQueue: Queue) {}
	async handleWebhookEvent(
		paystackHeaderSign: string,
		body: any,
	): Promise<void> {
		const hash = crypto
			.createHmac("sha512", this.paystackSecret)
			.update(JSON.stringify(body))
			.digest("hex");

		if (hash == paystackHeaderSign) {
			switch (body.event) {
				case "charge.success":
					await this.webhookQueue.add(SUCCESSFUL_PAYMENT_WEBHOOK, {
						body,
					});

					break;
				default:
					console.log(`Unhandled event type: ${body.event}`);
			}
		} else {
			console.warn("Invalid signature. Webhook event not processed.");

			return;
		}

		return;
	}
}
