import { Inject, Injectable } from "@nestjs/common";
import { Message, Messaging, MulticastMessage } from "firebase-admin/messaging";
import { DatabaseService } from "src/database/database.service";
import { notifications } from "../../database/schema";
import { desc, count } from "drizzle-orm";
import { FIREBASE_MESSAGING } from "../firbase/firebase.module";

@Injectable()
export class NotificationService {
	constructor(
		@Inject(FIREBASE_MESSAGING) private readonly messaging: Messaging,
		private readonly databaseService: DatabaseService,
	) {}

	async sendNotification({
		userId,
		message,
		token,
	}: {
		userId: string;
		message: Omit<Message, "token">;
		token?: string | null;
	}) {
		await this.databaseService.db.insert(notifications).values({
			// @ts-ignore
			userId,
			title: message.notification?.title,
			message: message.notification?.body,
		});

		if (token) {
			await this.messaging.send({ ...message, token });
		}

		return;
	}

	async getNotifications(userId: string, page: number, limit: number) {
		const offset = (page - 1) * limit;

		const notificationsList = await this.databaseService.db
			.select()
			.from(notifications)
			// @ts-ignore
			.where({ userId })
			.orderBy(desc(notifications.createdAt))
			.limit(limit)
			.offset(offset);

		const totalCount = await this.databaseService.db
			.select({
				count: count(notifications.id),
			})
			.from(notifications)
			// @ts-ignore
			.where({ userId })
			.groupBy(notifications.userId);

		return {
			notifications: notificationsList,
			totalCount,
			currentPage: page,
			totalPages: Math.ceil(totalCount[0].count / limit),
		};
	}

	async sendMulticastNotification(message: MulticastMessage): Promise<number> {
		const response = await this.messaging.sendEachForMulticast(message);

		return response.successCount;
	}

	async subscribeToTopic(tokens: string[], topic: string): Promise<number> {
		const response = await this.messaging.subscribeToTopic(tokens, topic);

		return response.successCount;
	}

	async unsubscribeFromTopic(tokens: string[], topic: string): Promise<number> {
		const response = await this.messaging.unsubscribeFromTopic(tokens, topic);

		return response.successCount;
	}

	async sendTopicNotification(
		message: Message & { topic: string },
	): Promise<string> {
		return this.messaging.send(message);
	}
}
