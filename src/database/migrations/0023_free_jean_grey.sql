RENAME TABLE `equipment_rentals_bookings` TO `equipment_rentals_cart`;--> statement-breakpoint
RENAME TABLE `food_orders` TO `food_cart`;--> statement-breakpoint
RENAME TABLE `food_order_addons` TO `food_cart_addons`;--> statement-breakpoint
RENAME TABLE `hotel_bookings` TO `hotel_cart`;--> statement-breakpoint
RENAME TABLE `movies_ticket_purchases` TO `movies_ticket_cart`;--> statement-breakpoint
RENAME TABLE `movies_ticket_snacks_purchases` TO `movies_ticket_snacks_cart`;--> statement-breakpoint
RENAME TABLE `studio_bookings` TO `studio_session_cart`;--> statement-breakpoint
RENAME TABLE `vrgames_ticket_purchases` TO `vrgames_ticket_cart`;--> statement-breakpoint
ALTER TABLE `food_cart_addons` RENAME COLUMN `food_order_id` TO `food_cart_id`;--> statement-breakpoint
ALTER TABLE `movies_ticket_snacks_cart` RENAME COLUMN `ticket_purchase_id` TO `ticket_cart_id`;--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` DROP FOREIGN KEY `fk_equipment_rentals_bookings_equipment_rental_id`;--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` DROP INDEX `uk_equipment_rentals_bookings_unique`;--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` ADD CONSTRAINT `fk_equipment_rentals_bookings_equipment_rental_id` FOREIGN KEY (`equipment_rental_id`) REFERENCES `equipment_rentals`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` DROP CONSTRAINT `chk_equipment_rentals_bookings_dates`;--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` DROP CONSTRAINT `chk_equipment_rentals_bookings_status`;--> statement-breakpoint
ALTER TABLE `food_cart` DROP CONSTRAINT `chk_food_orders_delivery_type`;--> statement-breakpoint
ALTER TABLE `food_cart` DROP CONSTRAINT `chk_food_orders_status`;--> statement-breakpoint
ALTER TABLE `hotel_cart` DROP CONSTRAINT `chk_hotel_bookings_dates`;--> statement-breakpoint
ALTER TABLE `hotel_cart` DROP CONSTRAINT `chk_hotel_bookings_status`;--> statement-breakpoint
ALTER TABLE `movies_ticket_cart` DROP CONSTRAINT `chk_movies_ticket_purchases_status`;--> statement-breakpoint
ALTER TABLE `studio_session_cart` DROP CONSTRAINT `chk_studio_bookings_time`;--> statement-breakpoint
ALTER TABLE `studio_session_cart` DROP CONSTRAINT `chk_studio_bookings_status`;--> statement-breakpoint
ALTER TABLE `vrgames_ticket_cart` DROP CONSTRAINT `chk_vrgames_ticket_purchases_status`;--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` DROP FOREIGN KEY `fk_equipment_rentals_bookings_equipment_rental_id`;--> statement-breakpoint
ALTER TABLE `food_cart_addons` DROP FOREIGN KEY `fk_food_order_addons_food_order_id`;--> statement-breakpoint
ALTER TABLE `food_cart_addons` DROP FOREIGN KEY `fk_food_order_addons_addon_category_id`;--> statement-breakpoint
ALTER TABLE `food_cart_addons` DROP FOREIGN KEY `fk_food_order_addons_addon_item_id`;--> statement-breakpoint
ALTER TABLE `food_cart` DROP FOREIGN KEY `fk_food_orders_food_id`;--> statement-breakpoint
ALTER TABLE `hotel_cart` DROP FOREIGN KEY `fk_hotel_bookings_hotel_id`;--> statement-breakpoint
ALTER TABLE `movies_ticket_cart` DROP FOREIGN KEY `fk_movies_ticket_purchases_showtime_id`;--> statement-breakpoint
ALTER TABLE `movies_ticket_snacks_cart` DROP FOREIGN KEY `fk_movies_ticket_snacks_purchases_ticket_purchase_id`;--> statement-breakpoint
ALTER TABLE `movies_ticket_snacks_cart` DROP FOREIGN KEY `fk_movies_ticket_snacks_purchases_snack_id`;--> statement-breakpoint
ALTER TABLE `studio_session_cart` DROP FOREIGN KEY `studio_bookings_studio_id_studios_id_fk`;--> statement-breakpoint
ALTER TABLE `studio_session_cart` DROP FOREIGN KEY `fk_studio_bookings_studio_id`;--> statement-breakpoint
ALTER TABLE `vrgames_ticket_cart` DROP FOREIGN KEY `fk_vrgames_ticket_purchases_vrgame_id`;--> statement-breakpoint
-- ALTER TABLE `equipment_rentals_cart` DROP PRIMARY KEY;--> statement-breakpoint
-- ALTER TABLE `food_cart_addons` DROP PRIMARY KEY;--> statement-breakpoint
-- ALTER TABLE `food_cart` DROP PRIMARY KEY;--> statement-breakpoint
-- ALTER TABLE `hotel_cart` DROP PRIMARY KEY;--> statement-breakpoint
-- ALTER TABLE `movies_ticket_cart` DROP PRIMARY KEY;--> statement-breakpoint
-- ALTER TABLE `movies_ticket_snacks_cart` DROP PRIMARY KEY;--> statement-breakpoint
-- ALTER TABLE `studio_session_cart` DROP PRIMARY KEY;--> statement-breakpoint
-- ALTER TABLE `vrgames_ticket_cart` DROP PRIMARY KEY;--> statement-breakpoint
-- ALTER TABLE `equipment_rentals_cart` ADD PRIMARY KEY(`id`);--> statement-breakpoint
-- ALTER TABLE `food_cart_addons` ADD PRIMARY KEY(`id`);--> statement-breakpoint
-- ALTER TABLE `food_cart` ADD PRIMARY KEY(`id`);--> statement-breakpoint
-- ALTER TABLE `hotel_cart` ADD PRIMARY KEY(`id`);--> statement-breakpoint
-- ALTER TABLE `movies_ticket_cart` ADD PRIMARY KEY(`id`);--> statement-breakpoint
-- ALTER TABLE `movies_ticket_snacks_cart` ADD PRIMARY KEY(`id`);--> statement-breakpoint
-- ALTER TABLE `studio_session_cart` ADD PRIMARY KEY(`id`);--> statement-breakpoint
-- ALTER TABLE `vrgames_ticket_cart` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` ADD CONSTRAINT `uk_equipment_rentals_cart_unique` UNIQUE(`equipment_rental_id`,`user_id`,`rental_start_date`,`rental_end_date`);--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` ADD CONSTRAINT `chk_equipment_rentals_cart_dates` CHECK (`equipment_rentals_cart`.`rental_start_date` <= `equipment_rentals_cart`.`rental_end_date`);--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` ADD CONSTRAINT `chk_equipment_rentals_cart_status` CHECK (`equipment_rentals_cart`.`status` IN ('pending', 'confirmed', 'cancelled', 'completed'));--> statement-breakpoint
ALTER TABLE `food_cart` ADD CONSTRAINT `chk_food_cart_delivery_type` CHECK (`food_cart`.`delivery_type` IN ('pickup', 'delivery'));--> statement-breakpoint
ALTER TABLE `food_cart` ADD CONSTRAINT `chk_food_cart_status` CHECK (`food_cart`.`status` IN ('pending', 'preparing', 'delivered', 'cancelled'));--> statement-breakpoint
ALTER TABLE `hotel_cart` ADD CONSTRAINT `chk_hotel_cart_dates` CHECK (`hotel_cart`.`check_in_date` < `hotel_cart`.`check_out_date`);--> statement-breakpoint
ALTER TABLE `hotel_cart` ADD CONSTRAINT `chk_hotel_cart_status` CHECK (`hotel_cart`.`status` IN ('pending', 'confirmed', 'cancelled', 'completed'));--> statement-breakpoint
ALTER TABLE `movies_ticket_cart` ADD CONSTRAINT `chk_movies_ticket_cart_status` CHECK (`movies_ticket_cart`.`status` IN ('pending', 'completed', 'canceled'));--> statement-breakpoint
ALTER TABLE `studio_session_cart` ADD CONSTRAINT `chk_studio_session_cart_time` CHECK (`studio_session_cart`.`start_time` < `studio_session_cart`.`end_time`);--> statement-breakpoint
ALTER TABLE `studio_session_cart` ADD CONSTRAINT `chk_studio_session_cart_status` CHECK (`studio_session_cart`.`status` IN ('pending', 'confirmed', 'cancelled', 'completed'));--> statement-breakpoint
ALTER TABLE `vrgames_ticket_cart` ADD CONSTRAINT `chk_vrgames_ticket_cart_status` CHECK (`vrgames_ticket_cart`.`status` IN ('pending', 'completed', 'canceled'));--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` ADD CONSTRAINT `fk_equipment_rentals_cart_equipment_rental_id` FOREIGN KEY (`equipment_rental_id`) REFERENCES `equipment_rentals`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_cart_addons` ADD CONSTRAINT `fk_food_cart_addons_food_cart_id` FOREIGN KEY (`food_cart_id`) REFERENCES `food_cart`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_cart_addons` ADD CONSTRAINT `fk_food_cart_addons_addon_category_id` FOREIGN KEY (`addon_category_id`) REFERENCES `food_addon_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_cart_addons` ADD CONSTRAINT `fk_food_cart_addons_addon_item_id` FOREIGN KEY (`addon_item_id`) REFERENCES `food_addons_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_cart` ADD CONSTRAINT `fk_food_cart_food_id` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hotel_cart` ADD CONSTRAINT `fk_hotel_cart_hotel_id` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movies_ticket_cart` ADD CONSTRAINT `fk_movies_ticket_cart_showtime_id` FOREIGN KEY (`showtime_id`) REFERENCES `cinema_movies_showtimes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movies_ticket_snacks_cart` ADD CONSTRAINT `fk_movies_ticket_snacks_cart_ticket_cart_id` FOREIGN KEY (`ticket_cart_id`) REFERENCES `movies_ticket_cart`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movies_ticket_snacks_cart` ADD CONSTRAINT `fk_movies_ticket_snacks_cart_snack_id` FOREIGN KEY (`snack_id`) REFERENCES `snacks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_session_cart` ADD CONSTRAINT `studio_session_cart_studio_id_studios_id_fk` FOREIGN KEY (`studio_id`) REFERENCES `studios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_session_cart` ADD CONSTRAINT `fk_studio_session_cart_studio_id` FOREIGN KEY (`studio_id`) REFERENCES `studios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vrgames_ticket_cart` ADD CONSTRAINT `fk_vrgames_ticket_cart_vrgame_id` FOREIGN KEY (`vrgame_id`) REFERENCES `vrgames`(`id`) ON DELETE cascade ON UPDATE no action;
