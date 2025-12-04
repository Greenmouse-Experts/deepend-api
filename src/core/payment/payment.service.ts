import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { init } from "@paralleldrive/cuid2";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { AxiosError } from "axios";
import { HandleAxiosError, MysqlDatabaseTransaction } from "src/common/helpers";
import { CreatePaymentRecord, Payments } from "src/database/schema";

@Injectable()
export class PaymentService {
	public readonly secretKey: string;
	public readonly paystackBaseUrl: string = "https://api.paystack.co";

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {
		this.secretKey = this.configService.get<string>(
			"PAYSTACK_SECRET_KEY",
		) as string;
	}

	async generatePaymentReference(): Promise<string> {
		const reference = init({
			length: 12,
		})();

		return reference;
	}

	async initializePayment({
		email,
		amount,
		reference,
		callback_url,
	}: {
		email: string;
		amount: number;
		reference: string;
		callback_url: string;
	}): Promise<any> {
		const { data } = await firstValueFrom(
			this.httpService
				.post(
					`${this.paystackBaseUrl}/transaction/initialize`,
					{
						email,
						amount,
						reference,
						callback_url,
					},
					{
						headers: {
							Authorization: `Bearer ${this.secretKey}`,
						},
					},
				)
				.pipe(
					catchError((error: AxiosError) => {
						const errorMessage = HandleAxiosError(error);

						throw new HttpException(
							errorMessage,
							error.response?.status as number,
						);
					}),
				),
		);

		return data;
	}

	async createPaymentRecord(
		paymentData: CreatePaymentRecord,
		transactions: MysqlDatabaseTransaction,
	) {
		const paymentRecord = await transactions
			.insert(Payments)
			.values({ ...paymentData })
			.$returningId();

		return paymentRecord;
	}

	async getDeliveryFeeSettings(transactions: MysqlDatabaseTransaction) {
		const deliveryFeeSettings =
			await transactions.query.adminDeliverySettings.findFirst();

		return deliveryFeeSettings;
	}

	async verifyPayment(reference: string): Promise<any> {
		const { data } = await firstValueFrom(
			this.httpService
				.get(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
					headers: {
						Authorization: `Bearer ${this.secretKey}`,
					},
				})
				.pipe(
					catchError((error: AxiosError) => {
						const errorMessage = HandleAxiosError(error);

						throw new HttpException(
							errorMessage,
							error.response?.status as number,
						);
					}),
				),
		);

		return data;
	}
}
