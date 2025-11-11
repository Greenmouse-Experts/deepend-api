CREATE TABLE `admin_delivery_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`price_per_km` decimal(10,2) NOT NULL,
	`origin_lat` decimal(10,7) NOT NULL DEFAULT '0',
	`origin_lng` decimal(10,7) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_delivery_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `equipment_rental_bookings` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `food_orders` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `hotel_bookings` MODIFY COLUMN `receipt_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `movie_ticket_purchases` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `studio_session_bookings` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `vrgame_ticket_purchases` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `food_cart` ADD `delivery_longitude` decimal(10,2);--> statement-breakpoint
ALTER TABLE `food_cart` ADD `delivery_latitude` decimal(10,2);--> statement-breakpoint
ALTER TABLE `food_orders` ADD `delivery_longitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `food_orders` ADD `delivery_latitude` decimal(10,7);