CREATE TABLE `notifications` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `fcm_token` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_index` ON `notifications` (`user_id`);