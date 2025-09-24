CREATE TABLE `verification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`otp_code` text NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`expires_at` timestamp(6) NOT NULL,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
# ALTER TABLE `users` ADD `refresh_token` text;--> statement-breakpoint
ALTER TABLE `verification` ADD CONSTRAINT `verification_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
