CREATE TABLE `hotel_bookings` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`hotel_id` varchar(15),
	`hotel_room_id` varchar(15) NOT NULL,
	`check_in_date` date NOT NULL,
	`check_out_date` date NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `hotel_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `chk_hotel_bookings_dates` CHECK(`hotel_bookings`.`check_in_date` < `hotel_bookings`.`check_out_date`),
	CONSTRAINT `chk_hotel_bookings_status` CHECK(`hotel_bookings`.`status` IN ('pending', 'confirmed', 'cancelled', 'completed'))
);
--> statement-breakpoint
ALTER TABLE `hotel_bookings` ADD CONSTRAINT `fk_hotel_bookings_hotel_id` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE no action ON UPDATE no action;