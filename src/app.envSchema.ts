import * as joi from "joi";

export const envSchema = joi.object({
	NODE_ENV: joi
		.string()
		.valid("development", "production", "test")
		.default("development"),
	DB_HOST: joi.string().required(),
	DB_PORT: joi.number().required(),
	DB_USER: joi.string().required(),
	DB_PASSWORD: joi.string().required(),
	DB_NAME: joi.string().required(),
	PORT: joi.number().default(3000),
	JWT_ACCESS_SECRET: joi.string().required(),
	JWT_ACCESS_EXPIRATION_TIME: joi.string().required(),
	JWT_REFRESH_SECRET: joi.string().required(),
	JWT_REFRESH_EXPIRATION_TIME: joi.string().required(),
	VERIFICATION_TOKEN_EXPIRY_TIME: joi.string().required(),
	SMTP_HOST: joi.string().required(),
	SMTP_PORT: joi.number().required(),
	DEEPEND_MAIL_FROM: joi.string().email().required(),
	REDIS_QUEUE_URL: joi.string().required(),
	PAYSTACK_SECRET_KEY: joi.string().required(),
	RECEIPT_BARCODE_SECRET_KEY: joi.string().required(),
	TICKET_QR_CODE_SECRET_KEY: joi.string().required(),
	BULL_BOARD_ADMIN_PASSWORD: joi.string().required(),
});
