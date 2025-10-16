CREATE TABLE `studios_availability` (
	`id` varchar(15) NOT NULL,
	`studio_id` int NOT NULL,
	`day_of_week` smallint NOT NULL,
	`start_time` time NOT NULL,
	`end_time` time NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `studios_availability_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_studio_availability_unique` UNIQUE(`studio_id`,`day_of_week`),
	CONSTRAINT `chk_studio_availability_time` CHECK(`studios_availability`.`start_time` < `studios_availability`.`end_time`),
	CONSTRAINT `chk_studio_availability_day_of_week` CHECK(`studios_availability`.`day_of_week` BETWEEN 0 AND 6)
);
--> statement-breakpoint
CREATE TABLE `studio_bookings` (
	`id` varchar(15) NOT NULL,
	`studio_id` int NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`booking_date` date NOT NULL,
	`start_time` time NOT NULL,
	`end_time` time NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `studio_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `chk_studio_bookings_time` CHECK(`studio_bookings`.`start_time` < `studio_bookings`.`end_time`),
	CONSTRAINT `chk_studio_bookings_status` CHECK(`studio_bookings`.`status` IN ('pending', 'confirmed', 'cancelled', 'completed'))
);
--> statement-breakpoint
CREATE TABLE `studios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(512) NOT NULL,
	`hourly_rate` decimal(10,2) NOT NULL,
	`is_available` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `studios_id` PRIMARY KEY(`id`),
	CONSTRAINT `studios_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `studios_availability` ADD CONSTRAINT `studios_availability_studio_id_studios_id_fk` FOREIGN KEY (`studio_id`) REFERENCES `studios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studios_availability` ADD CONSTRAINT `fk_studio_availability_studio_id` FOREIGN KEY (`studio_id`) REFERENCES `studios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_bookings` ADD CONSTRAINT `studio_bookings_studio_id_studios_id_fk` FOREIGN KEY (`studio_id`) REFERENCES `studios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_bookings` ADD CONSTRAINT `fk_studio_bookings_studio_id` FOREIGN KEY (`studio_id`) REFERENCES `studios`(`id`) ON DELETE cascade ON UPDATE no action;