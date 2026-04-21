CREATE TABLE `food_addon_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `food_addon_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `food_addon_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `food_addons_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`category_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `food_addons_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `food_addons_items_name_unique` UNIQUE(`name`),
	CONSTRAINT `food_addons_items_category_id_id_unique` UNIQUE(`category_id`,`id`)
);
--> statement-breakpoint
CREATE TABLE `food_to_addons_categories` (
	`food_id` varchar(15) NOT NULL,
	`addon_category_id` int NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `food_to_addons_categories_food_id_addon_category_id_pk` PRIMARY KEY(`food_id`,`addon_category_id`)
);
--> statement-breakpoint
CREATE TABLE `food_to_addons_items` (
	`food_id` varchar(15) NOT NULL,
	`addon_category_id` int NOT NULL,
	`addon_item_id` int NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `food_to_addons_items_food_id_addon_item_id_pk` PRIMARY KEY(`food_id`,`addon_item_id`)
);
--> statement-breakpoint
ALTER TABLE `food_categories` ADD `icon` text;--> statement-breakpoint
ALTER TABLE `food_addons_items` ADD CONSTRAINT `food_addons_items_category_id_food_addon_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `food_addon_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_to_addons_categories` ADD CONSTRAINT `food_to_addons_categories_food_id_foods_id_fk` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_to_addons_categories` ADD CONSTRAINT `fk_food_to_addon_category_id` FOREIGN KEY (`addon_category_id`) REFERENCES `food_addon_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_to_addons_items` ADD CONSTRAINT `food_to_addons_items_addon_item_id_food_addons_items_id_fk` FOREIGN KEY (`addon_item_id`) REFERENCES `food_addons_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_to_addons_items` ADD CONSTRAINT `fk_food_to_addon_item_category_id` FOREIGN KEY (`addon_category_id`) REFERENCES `food_addon_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_to_addons_items` ADD CONSTRAINT `fk_food_to_addon_item_food_id_category_id` FOREIGN KEY (`food_id`,`addon_category_id`) REFERENCES `food_to_addons_categories`(`food_id`,`addon_category_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_to_addons_items` ADD CONSTRAINT `fk_food_to_addon_item_category_item_id` FOREIGN KEY (`addon_category_id`,`addon_item_id`) REFERENCES `food_addons_items`(`category_id`,`id`) ON DELETE no action ON UPDATE no action;