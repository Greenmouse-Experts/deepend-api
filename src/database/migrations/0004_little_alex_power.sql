ALTER TABLE `foods` ADD `quantity` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `foods` ADD `is_available` boolean DEFAULT false NOT NULL;