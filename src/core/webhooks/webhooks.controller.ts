import { Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { WebhooksService } from "./webhooks.service";

@Controller({ path: "webhooks", version: "1" })
export class WebhooksController {
	constructor(private readonly webhooksService: WebhooksService) {}

	@Post("paystack")
	async handleWebhook(
		@Req() request: Request,
		@Res()
		response: Response,
	) {
		const paystackHeaderSign = request.headers[
			"x-paystack-signature"
		] as string;

		if (!paystackHeaderSign) {
			return response.status(400).json("Missing Paystack signature header");
		}

		const body = request.body;

		await this.webhooksService.handleWebhookEvent(paystackHeaderSign, body);

		return response.status(200).send();
	}
}
