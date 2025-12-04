import { Controller, Get, Injectable, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { CallbackService } from "./callback.service";

@Controller({ version: "1", path: "callback" })
@Injectable()
export class CallbackController {
	constructor(private readonly callbackService: CallbackService) {}
	@Get("paystack")
	async handleCallback(@Req() request: Request, @Res() response: Response) {
		const query = request.query;

		const res = await this.callbackService.handleCallbackEvent(query);

		return response.redirect(res);
	}

	@Get("paymentStatus")
	async getPaymentStatus(@Req() request: Request, @Res() response: Response) {
		return response.status(200).send("Payment received");
	}
}
