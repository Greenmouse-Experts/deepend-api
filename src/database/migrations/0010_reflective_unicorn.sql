CREATE TABLE `cinema_movies_genres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `cinema_movies_genres_id` PRIMARY KEY(`id`),
	CONSTRAINT `cinema_movies_genres_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `cinema_halls` (
	`id` varchar(15) NOT NULL,
	`cinema_id` varchar(15) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `cinema_halls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cinema_movies` (
	`id` varchar(15) NOT NULL,
	`cinema_id` varchar(15) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1024),
	`duration_minutes` int NOT NULL,
	`age_rating` int NOT NULL DEFAULT 0,
	`poster_url` varchar(512),
	`poster_path` varchar(512),
	`trailer_url` text,
	`trailer_path` text,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `cinema_movies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cinema_movies_showtimes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`movie_id` varchar(15) NOT NULL,
	`cinema_hall_id` varchar(15) NOT NULL,
	`show_date` date NOT NULL,
	`showtime` time NOT NULL,
	`ticket_price` decimal(10,2) NOT NULL,
	`total_seats` int NOT NULL DEFAULT 100,
	`is_available` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `cinema_movies_showtimes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cinema_movies_to_genres` (
	`movie_id` varchar(15) NOT NULL,
	`genre_id` int NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `cinema_movies_to_genres_movie_id_genre_id_pk` PRIMARY KEY(`movie_id`,`genre_id`)
);
--> statement-breakpoint
CREATE TABLE `cinemas` (
	`id` varchar(15) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(512) NOT NULL,
	`city` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`country_id` int NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL,
	CONSTRAINT `cinemas_id` PRIMARY KEY(`id`),
	CONSTRAINT `cinemas_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `cinema_halls` ADD CONSTRAINT `cinema_halls_cinema_id_cinemas_id_fk` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cinema_movies` ADD CONSTRAINT `cinema_movies_cinema_id_cinemas_id_fk` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cinema_movies_showtimes` ADD CONSTRAINT `fk_cinema_movie_showtime_movie_id` FOREIGN KEY (`movie_id`) REFERENCES `cinema_movies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cinema_movies_showtimes` ADD CONSTRAINT `fk_cinema_movie_showtime_cinema_hall_id` FOREIGN KEY (`cinema_hall_id`) REFERENCES `cinema_halls`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cinema_movies_to_genres` ADD CONSTRAINT `fk_cinema_movie_to_genre_movie_id` FOREIGN KEY (`movie_id`) REFERENCES `cinema_movies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cinema_movies_to_genres` ADD CONSTRAINT `fk_cinema_movie_to_genre_genre_id` FOREIGN KEY (`genre_id`) REFERENCES `cinema_movies_genres`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cinemas` ADD CONSTRAINT `cinemas_country_id_countries_id_fk` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;