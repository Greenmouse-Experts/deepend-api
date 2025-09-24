import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import type { MailerOptions } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { join } from "path";
import { MailService } from "./mail.service";

@Module({
	imports: [
		ConfigModule,
		MailerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService): MailerOptions => {
				const transport: SMTPTransport.Options = {
					host: config.get<string>("SMTP_HOST"),
					port: config.get<number>("SMTP_PORT"), // must be a number
					secure: false,
					auth: {
						user: config.get<string>("SMTP_USER"),
						pass: config.get<string>("SMTP_PASS"),
					},
					tls: { rejectUnauthorized: false },
				};

				return {
					transport,
					defaults: {
						from: config.get<string>("DEEPEND_MAIL_FROM"),
					},
					template: {
						dir: join(__dirname, "templates"),
						adapter: new HandlebarsAdapter(),
						options: { strict: true },
					},
				};
			},
		}),
	],
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}
