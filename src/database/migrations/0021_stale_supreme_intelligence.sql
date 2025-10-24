CREATE TABLE `food_order_addons` (
	`id` varchar(15) NOT NULL,
	`food_order_id` varchar(15) NOT NULL,
	`addon_category_id` int NOT NULL,
	`addon_item_id` int NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `food_order_addons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `food_order_addons` ADD CONSTRAINT `fk_food_order_addons_food_order_id` FOREIGN KEY (`food_order_id`) REFERENCES `food_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_order_addons` ADD CONSTRAINT `fk_food_order_addons_addon_category_id` FOREIGN KEY (`addon_category_id`) REFERENCES `food_addon_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_order_addons` ADD CONSTRAINT `fk_food_order_addons_addon_item_id` FOREIGN KEY (`addon_item_id`) REFERENCES `food_addons_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_orders` ADD CONSTRAINT `chk_food_orders_delivery_type` CHECK (`food_orders`.`delivery_type` IN ('pickup', 'delivery'));--> statement-breakpoint
ALTER TABLE `food_orders` ADD CONSTRAINT `chk_food_orders_status` CHECK (`food_orders`.`status` IN ('pending', 'preparing', 'delivered', 'cancelled'));--> statement-breakpoint
ALTER TABLE `food_orders` DROP COLUMN `addons`;