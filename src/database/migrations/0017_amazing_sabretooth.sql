CREATE TABLE `vrgames_availability` (
	`id` varchar(15) NOT NULL,
	`vrgame_id` varchar(15),
	`day_of_week` smallint NOT NULL,
	`start_time` time NOT NULL,
	`end_time` time NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `vrgames_availability_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_vrgames_availability_unique` UNIQUE(`vrgame_id`,`day_of_week`),
	CONSTRAINT `chk_vrgames_availability_time` CHECK(`vrgames_availability`.`start_time` < `vrgames_availability`.`end_time`),
	CONSTRAINT `chk_vrgames_availability_day_of_week` CHECK(`vrgames_availability`.`day_of_week` BETWEEN 0 AND 6)
);
--> statement-breakpoint
CREATE TABLE `vrgames_ticket_purchases` (
	`id` varchar(15) NOT NULL,
	`vrgame_id` varchar(15) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`ticket_quantity` int NOT NULL DEFAULT 1,
	`total_price` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`scheduled_date` date NOT NULL,
	`scheduled_time` time NOT NULL,
	`purchase_date` timestamp(6) NOT NULL DEFAULT (now()),
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `vrgames_ticket_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `chk_vrgames_ticket_purchases_status` CHECK(`vrgames_ticket_purchases`.`status` IN ('pending', 'completed', 'canceled'))
);
--> statement-breakpoint
ALTER TABLE `vrgames_availability` MODIFY COLUMN `vrgame_id` varchar(15) NOT NULL;--> statement-breakpoint
ALTER TABLE `vrgames_availability` ADD CONSTRAINT `fk_vrgames_availability_vrgame_id` FOREIGN KEY (`vrgame_id`) REFERENCES `vrgames`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vrgames_ticket_purchases` ADD CONSTRAINT `fk_vrgames_ticket_purchases_vrgame_id` FOREIGN KEY (`vrgame_id`) REFERENCES `vrgames`(`id`) ON DELETE cascade ON UPDATE no action;
