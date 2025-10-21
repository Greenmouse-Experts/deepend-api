CREATE TABLE `movies_ticket_purchases` (
	`id` varchar(15) NOT NULL,
	`showtime_id` int NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`ticket_quantity` int NOT NULL DEFAULT 1,
	`total_price` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`purchase_date` timestamp(6),
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `movies_ticket_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `chk_movies_ticket_purchases_status` CHECK(`movies_ticket_purchases`.`status` IN ('pending', 'completed', 'canceled'))
);
--> statement-breakpoint
CREATE TABLE `movies_ticket_snacks_purchases` (
	`id` varchar(15) NOT NULL,
	`ticket_purchase_id` varchar(15) NOT NULL,
	`snack_id` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `movies_ticket_snacks_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `movies_ticket_purchases` ADD CONSTRAINT `fk_movies_ticket_purchases_showtime_id` FOREIGN KEY (`showtime_id`) REFERENCES `cinema_movies_showtimes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movies_ticket_snacks_purchases` ADD CONSTRAINT `fk_movies_ticket_snacks_purchases_ticket_purchase_id` FOREIGN KEY (`ticket_purchase_id`) REFERENCES `movies_ticket_purchases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movies_ticket_snacks_purchases` ADD CONSTRAINT `fk_movies_ticket_snacks_purchases_snack_id` FOREIGN KEY (`snack_id`) REFERENCES `snacks`(`id`) ON DELETE cascade ON UPDATE no action;
