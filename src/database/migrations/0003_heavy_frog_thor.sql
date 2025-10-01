CREATE TABLE `foods` (
	`id` varchar(15) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(1024),
	`price` decimal(10,2) NOT NULL,
	`category_id` int NOT NULL,
	`image_urls` json NOT NULL DEFAULT ('[]'),
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `foods_id` PRIMARY KEY(`id`),
	CONSTRAINT `foods_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `foods` ADD CONSTRAINT `foods_category_id_food_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `food_categories`(`id`) ON DELETE no action ON UPDATE no action;