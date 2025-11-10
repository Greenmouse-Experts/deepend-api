ALTER TABLE `hotel_bookings` RENAME COLUMN `reciept_barcode_data` TO `receipt_barcode_data`;--> statement-breakpoint
ALTER TABLE `equipment_rental_bookings` MODIFY COLUMN `reciept_barcode_data` json;--> statement-breakpoint
ALTER TABLE `equipment_rental_bookings` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `food_orders` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `hotel_bookings` MODIFY COLUMN `receipt_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `movie_ticket_purchases` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `studio_session_bookings` MODIFY COLUMN `reciept_barcode_data` varchar(500);--> statement-breakpoint
ALTER TABLE `vrgame_ticket_purchases` MODIFY COLUMN `reciept_barcode_data` varchar(500);

