CREATE TABLE `vrgames_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `vrgames_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `vrgames_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `vrgames` (
	`id` varchar(15) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(1024),
	`category_id` int NOT NULL,
	`image_urls` json NOT NULL DEFAULT ('[]'),
	`age_rating` int NOT NULL DEFAULT 0,
	`ticket_price` decimal(10,2) NOT NULL,
	`tikcet_quantity` int NOT NULL DEFAULT 1,
	`is_available` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `vrgames_id` PRIMARY KEY(`id`),
	CONSTRAINT `vrgames_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `vrgames` ADD CONSTRAINT `vrgames_category_id_vrgames_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `vrgames_categories`(`id`) ON DELETE no action ON UPDATE no action;