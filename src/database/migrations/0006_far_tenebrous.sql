CREATE TABLE `advert_banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`image_urls` json NOT NULL,
	`link_url` text NOT NULL,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `advert_banners_id` PRIMARY KEY(`id`)
);
