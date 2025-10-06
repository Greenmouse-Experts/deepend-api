CREATE TABLE `hotel_amenities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(255) NOT NULL,
	`icon_path` varchar(255) NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `hotel_amenities_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotel_amenities_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `hotel_rooms` (
	`id` varchar(15) NOT NULL,
	`hotel_id` varchar(15) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(1024),
	`price_per_night` decimal(10,2) NOT NULL,
	`image_urls` json NOT NULL DEFAULT ('[]'),
	`capacity` int NOT NULL DEFAULT 1,
	`is_available` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `hotel_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotel_to_amenities` (
	`hotel_id` varchar(15) NOT NULL,
	`amenity_id` int NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `hotel_to_amenities_hotel_id_amenity_id_pk` PRIMARY KEY(`hotel_id`,`amenity_id`)
);
--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` varchar(15) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(1024),
	`address` varchar(512) NOT NULL,
	`city` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`country` varchar(255) NOT NULL,
	`image_urls` json NOT NULL DEFAULT ('[]'),
	`rating` decimal(2,1) NOT NULL DEFAULT '0',
	`is_available` boolean NOT NULL DEFAULT false,
	`coordinates` point NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotels_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `hotel_rooms` ADD CONSTRAINT `hotel_rooms_hotel_id_hotels_id_fk` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hotel_to_amenities` ADD CONSTRAINT `fk_hotel_to_amenity_hotel_id` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hotel_to_amenities` ADD CONSTRAINT `fk_hotel_to_amenity_amenity_id` FOREIGN KEY (`amenity_id`) REFERENCES `hotel_amenities`(`id`) ON DELETE cascade ON UPDATE no action;