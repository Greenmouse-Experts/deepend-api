import {
	OnQueueEvent,
	QueueEventsHost,
	QueueEventsListener,
} from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { WEBHOOKS_QUEUE } from "src/common/constants";

@QueueEventsListener(WEBHOOKS_QUEUE)
export class WebhooksListener extends QueueEventsHost {
	private logger = new Logger(WebhooksListener.name);

	@OnQueueEvent("added")
	onAdded(job: { jobId: string; name: string }) {
		this.logger.log(`Added job ${job.jobId} with name ${job.name}`);
	}

	@OnQueueEvent("active")
	onActive(job: { jobId: string; prev?: string }) {
		this.logger.log(`Processing job ${job.jobId}....`);
	}

	@OnQueueEvent("failed")
	onFailed(job: { jobId: string; prev?: string }) {
		this.logger.error(`Failed to process job ${job.jobId}`);
	}

	@OnQueueEvent("completed")
	onCompleted(job: { jobId: string; prev?: string }) {
		this.logger.debug(`Job ${job.jobId} completed.`);
	}
}
