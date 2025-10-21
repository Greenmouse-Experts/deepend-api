CREATE TABLE `equipment_rentals_bookings` (
	`id` varchar(15) NOT NULL,
	`equipment_rental_id` varchar(15),
	`user_id` varchar(15) NOT NULL,
	`rental_start_date` date NOT NULL,
	`rental_end_date` date NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `equipment_rentals_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_equipment_rentals_bookings_unique` UNIQUE(`equipment_rental_id`,`user_id`,`rental_start_date`,`rental_end_date`),
	CONSTRAINT `chk_equipment_rentals_bookings_dates` CHECK(`equipment_rentals_bookings`.`rental_start_date` <= `equipment_rentals_bookings`.`rental_end_date`),
	CONSTRAINT `chk_equipment_rentals_bookings_status` CHECK(`equipment_rentals_bookings`.`status` IN ('pending', 'confirmed', 'cancelled', 'completed'))
);
--> statement-breakpoint
ALTER TABLE `equipment_rentals_bookings` ADD CONSTRAINT `fk_equipment_rentals_bookings_equipment_rental_id` FOREIGN KEY (`equipment_rental_id`) REFERENCES `equipment_rentals`(`id`) ON DELETE set null ON UPDATE no action;