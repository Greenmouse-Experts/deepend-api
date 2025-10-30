CREATE TABLE `food_orders` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`food_id` varchar(15) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`addons` json,
	`total_price` decimal(10,2) NOT NULL,
	`order_date` timestamp(6),
	`delivery_type` varchar(50) NOT NULL,
	`delivery_address` varchar(512),
	`special_instructions` varchar(1024),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `food_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `food_orders` ADD CONSTRAINT `fk_food_orders_food_id` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE cascade ON UPDATE no action;
