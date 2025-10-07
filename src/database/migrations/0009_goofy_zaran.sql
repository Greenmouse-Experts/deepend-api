CREATE TABLE `equipment_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` text,
	`icon_path` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `equipment_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipment_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `equipment_rentals` (
	`id` varchar(15) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(1024),
	`category_id` int NOT NULL,
	`image_urls` json NOT NULL DEFAULT ('[]'),
	`rental_price_per_day` decimal(10,2) NOT NULL,
	`address` varchar(512) NOT NULL,
	`quantity_available` int NOT NULL DEFAULT 1,
	`is_available` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `equipment_rentals_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipment_rentals_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `equipment_rentals` ADD CONSTRAINT `fk_equipment_rentals_category_id` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories`(`id`) ON DELETE cascade ON UPDATE no action;