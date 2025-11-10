ALTER TABLE `equipment_rentals_cart` DROP CONSTRAINT `chk_equipment_rentals_cart_status`;--> statement-breakpoint
ALTER TABLE `movies_ticket_cart` DROP CONSTRAINT `chk_movies_ticket_cart_status`;--> statement-breakpoint
ALTER TABLE `vrgames_ticket_cart` DROP CONSTRAINT `chk_vrgames_ticket_cart_status`;--> statement-breakpoint
ALTER TABLE `movie_ticket_purchases` DROP CONSTRAINT `movie_ticket_purchases_status_check`;--> statement-breakpoint
ALTER TABLE `equipment_rentals_cart` ADD CONSTRAINT `chk_equipment_rentals_cart_status` CHECK (`equipment_rentals_cart`.`status` IN ('pending', 'ongoing', 'cancelled', 'completed'));--> statement-breakpoint
ALTER TABLE `movies_ticket_cart` ADD CONSTRAINT `chk_movies_ticket_cart_status` CHECK (`movies_ticket_cart`.`status` IN ('pending', 'completed', 'cancelled'));--> statement-breakpoint
ALTER TABLE `vrgames_ticket_cart` ADD CONSTRAINT `chk_vrgames_ticket_cart_status` CHECK (`vrgames_ticket_cart`.`status` IN ('pending', 'completed', 'cancelled'));--> statement-breakpoint
ALTER TABLE `movie_ticket_purchases` ADD CONSTRAINT `movie_ticket_purchases_status_check` CHECK (status IN ('pending' ,'completed', 'cancelled'));
