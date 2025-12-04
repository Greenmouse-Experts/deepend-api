import { Injectable } from "@nestjs/common";
import { MailerService as NodemailerService } from "@nestjs-modules/mailer";
import * as path from "path";
import { AdminPaymentSuccessData, PaymentSuccessData } from "./mail.dto";

@Injectable()
export class MailService {
	constructor(private readonly nodemailerService: NodemailerService) {}

	async sendMail({
		email,
		context,
		subject,
		text,
		templatePath,
	}: {
		email: string;
		context: object;
		subject: string;
		text?: string;
		templatePath: string;
	}) {
		try {
			const mailResult = await this.nodemailerService.sendMail({
				from: process.env.DEEPEND_MAIL_FROM,
				to: email,
				subject,
				text,
				template: path.join(__dirname, "templates", `${templatePath}`), // or './templates/'
				context,
			});
			console.log("Mail sent successfully:", mailResult);
			return;
		} catch (error) {
			console.error("Error sending mail:", error);
			throw error;
		}
	}

	async sendEmailVerification({
		email,
		code,
		firstName,
	}: { email: string; code: string; firstName: string }) {
		const subject = "Verify your email";
		const templatePath = "emailVerification"; // Assuming you have a template named 'emailVerification'
		const context = { firstName, code };

		return await this.sendMail({ email, context, subject, templatePath });
	}

	async sendWelcomeEmail({
		email,
		firstName,
	}: { email: string; firstName: string }) {
		const subject = "Welcome to DeepEnd!";
		const templatePath = "welcomeEmail"; // Assuming you have a template named 'welcomeEmail'

		const context = { firstName };

		return await this.sendMail({ email, context, subject, templatePath });
	}

	async sendPasswordReset({
		email,
		code,
		firstName,
	}: { email: string; code: string; firstName: string }) {
		const subject = "Reset your password";
		const templatePath = "passwordReset"; // Assuming you have a template named 'passwordReset'
		const context = { firstName, code };

		return await this.sendMail({ email, context, subject, templatePath });
	}

	async sendSuccessfulPayment({
		email,
		paymentData,
	}: { email: string; paymentData: PaymentSuccessData }) {
		try {
			const subject = "Payment Successful";
			const templatePath = "successfulPayment"; // Assuming you have a template named 'successfulPayment'
			const context = { ...paymentData };

			return await this.sendMail({ email, context, subject, templatePath });
		} catch (err) {
			throw err;
		}
	}

	async sendAdminSuccessfulPayment(
		adminEmails: string[],
		paymentData: AdminPaymentSuccessData,
	) {
		try {
			const subject = "New Payment Received";
			const templatePath = "adminSuccessfulPayment"; // Assuming you have a template named 'adminSuccessfulPayment'
			const context = { ...paymentData };

			for (const email of adminEmails) {
				await this.sendMail({ email, context, subject, templatePath });
			}
		} catch (err) {
			throw err;
		}
	}
}
