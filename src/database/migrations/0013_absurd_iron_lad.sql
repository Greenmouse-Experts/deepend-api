CREATE TABLE `movies_snacks` (
	`movie_id` varchar(15) NOT NULL,
	`snack_id` int NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `movies_snacks_movie_id_snack_id_pk` PRIMARY KEY(`movie_id`,`snack_id`)
);
--> statement-breakpoint
CREATE TABLE `snacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`is_available` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `snacks_id` PRIMARY KEY(`id`),
	CONSTRAINT `snacks_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `cinema_movies` ADD `cast` text;--> statement-breakpoint
ALTER TABLE `movies_snacks` ADD CONSTRAINT `fk_movies_snacks_movie_id` FOREIGN KEY (`movie_id`) REFERENCES `cinema_movies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movies_snacks` ADD CONSTRAINT `fk_movies_snacks_snack_id` FOREIGN KEY (`snack_id`) REFERENCES `snacks`(`id`) ON DELETE cascade ON UPDATE no action;