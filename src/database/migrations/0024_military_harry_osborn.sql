CREATE TABLE `payments` (
	`id` varchar(15) NOT NULL,
	`order_id` varchar(191) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'NGN',
	`status` varchar(50) NOT NULL,
	`payment_reference` varchar(15) NOT NULL,
	`payment_channel` varchar(100),
	`paid_at` timestamp NOT NULL,
	`payment_details` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_payment_reference_unique` UNIQUE(`payment_reference`),
	CONSTRAINT `payments_status_check` CHECK(`payments`.`status` IN ('pending', 'successful', 'failed'))
);
--> statement-breakpoint
CREATE TABLE `equipment_rental_bookings` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`order_id` varchar(191) NOT NULL,
	`equipment_id` varchar(191) NOT NULL,
	`equipment_name` varchar(255) NOT NULL,
	`equipment_image_url` varchar(500) NOT NULL,
	`rental_price_per_day` decimal(10,2) NOT NULL,
	`address` varchar(500) NOT NULL,
	`rental_start_date` date NOT NULL,
	`rental_end_date` date NOT NULL,
	`quantity` int NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`reciept_barcode_data` varchar(1000),
	`currency` varchar(10) NOT NULL DEFAULT 'NGN',
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_rental_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipment_rental_bookings_status_check` CHECK(status IN ('pending', 'ongoing', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE `food_orders` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`order_id` varchar(191) NOT NULL,
	`food_id` varchar(191) NOT NULL,
	`food_name` varchar(255) NOT NULL,
	`food_image_url` varchar(500) NOT NULL,
	`quantity` int NOT NULL,
	`food_price` decimal(10,2) NOT NULL,
	`food_addons` json NOT NULL DEFAULT ('[]'),
	`total_price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'NGN',
	`delivery_type` varchar(50) NOT NULL,
	`delivery_address` varchar(500),
	`special_instructions` varchar(500) DEFAULT '',
	`reciept_barcode_data` varchar(1000),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `food_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `food_orders_delivery_type_check` CHECK(delivery_type IN ('pickup', 'delivery')),
	CONSTRAINT `food_orders_delivery_address_check` CHECK((`food_orders`.`delivery_type` = 'delivery' AND `food_orders`.`delivery_address` IS NOT NULL) OR (`food_orders`.`delivery_type` = 'pickup')),
	CONSTRAINT `food_orders_status_check` CHECK(status IN ('pending', 'preparing', 'delivered', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE `hotel_bookings` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`order_id` varchar(191) NOT NULL,
	`hotel_name` varchar(255) NOT NULL,
	`hotel_image_url` varchar(500) NOT NULL,
	`hotel_id` varchar(191) NOT NULL,
	`hotel_room_id` varchar(191) NOT NULL,
	`hotel_room_name` varchar(255) NOT NULL,
	`hotel_room_price_per_night` decimal(10,2) NOT NULL,
	`check_in_date` date NOT NULL,
	`check_out_date` date NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'NGN',
	`qrcode_data` json,
	`reciept_barcode_data` varchar(1000),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotel_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotel_bookings_status_check` CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);
--> statement-breakpoint
CREATE TABLE `movie_ticket_purchases` (
	`ticket_id` varchar(15) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`order_id` varchar(191) NOT NULL,
	`movie_id` varchar(191) NOT NULL,
	`movie_name` varchar(255) NOT NULL,
	`movie_image_url` varchar(500) NOT NULL,
	`cinema_hall_id` varchar(191) NOT NULL,
	`genre` varchar(100) NOT NULL,
	`cinema_hall_name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`ticket_price` decimal(10,2) NOT NULL,
	`ticket_quantity` int NOT NULL,
	`show_date` date NOT NULL,
	`showtime` time NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`purchase_date` timestamp(6) NOT NULL DEFAULT (now()),
	`is_used` boolean NOT NULL DEFAULT false,
	`qrcode_data` json,
	`reciept_barcode_data` varchar(1000),
	`verified_at` timestamp,
	`verified_by` varchar(15),
	`snack_add_ons` json NOT NULL DEFAULT ('[]'),
	`currency` varchar(10) NOT NULL DEFAULT 'NGN',
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `movie_ticket_purchases_ticket_id` PRIMARY KEY(`ticket_id`),
	CONSTRAINT `movie_ticket_purchases_status_check` CHECK(status IN ('pending' ,'completed', 'canceled'))
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`payment_reference` varchar(15) NOT NULL,
	`delivery_fee` decimal(10,2) NOT NULL DEFAULT '0',
	`tax_amount` decimal(10,2),
	`subtotal_amount` decimal(10,2) NOT NULL,
	`total_amount` decimal(10,2) NOT NULL,
	`payment_method` varchar(50) NOT NULL,
	`currency` varchar(10) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`order_details` json NOT NULL DEFAULT ('[]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_payment_reference_unique` UNIQUE(`payment_reference`),
	CONSTRAINT `orders_status_check` CHECK(`orders`.`status` IN ('pending', 'completed', 'failed')),
	CONSTRAINT `payments_payment_method_check` CHECK(`orders`.`payment_method` IN ('paystack')),
	CONSTRAINT `check_order_details_not_empty` CHECK(`orders`.`status` != 'completed' OR JSON_LENGTH(`orders`.`order_details`) > 0)
);
--> statement-breakpoint
CREATE TABLE `studio_session_bookings` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`order_id` varchar(191) NOT NULL,
	`studio_id` int NOT NULL,
	`studio_name` varchar(255) NOT NULL,
	`session_price_per_hour` decimal(10,2) NOT NULL,
	`session_date` date NOT NULL,
	`session_start_time` time NOT NULL,
	`session_end_time` time NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'NGN',
	`qrcode_data` json,
	`reciept_barcode_data` varchar(1000),
	`verified_at` timestamp,
	`verified_by` varchar(15),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_session_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `studio_session_bookings_status_check` CHECK(status IN ('pending', 'scheduled', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE `vrgame_ticket_purchases` (
	`ticket_id` varchar(15) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`order_id` varchar(191) NOT NULL,
	`vrgame_center_id` varchar(191) NOT NULL,
	`vrgame_center_name` varchar(255) NOT NULL,
	`vrgame_center_image_url` varchar(500) NOT NULL,
	`vrgame_category` varchar(100) NOT NULL,
	`ticket_price` decimal(10,2) NOT NULL,
	`ticket_quantity` int NOT NULL,
	`scheduled_date` date NOT NULL,
	`scheduled_time` time NOT NULL,
	`purchase_date` timestamp(6) NOT NULL DEFAULT (now()),
	`total_price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'NGN',
	`is_used` boolean NOT NULL DEFAULT false,
	`qrcode_data` json,
	`reciept_barcode_data` varchar(1000),
	`verified_at` timestamp,
	`verified_by` varchar(15),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vrgame_ticket_purchases_ticket_id` PRIMARY KEY(`ticket_id`),
	CONSTRAINT `vrgame_ticket_purchases_status_check` CHECK(status IN ('pending', 'completed', 'cancelled'))
);
--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `equipment_rental_bookings` ADD CONSTRAINT `equipment_rental_bookings_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_orders` ADD CONSTRAINT `food_orders_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hotel_bookings` ADD CONSTRAINT `hotel_bookings_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movie_ticket_purchases` ADD CONSTRAINT `movie_ticket_purchases_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_session_bookings` ADD CONSTRAINT `studio_session_bookings_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vrgame_ticket_purchases` ADD CONSTRAINT `vrgame_ticket_purchases_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;
