CREATE TABLE `food_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `food_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `food_categories_name_unique` UNIQUE(`name`)
);
