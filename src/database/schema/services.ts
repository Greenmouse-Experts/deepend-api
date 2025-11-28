import {
	decimal,
	varchar,
	mysqlTable,
	json,
	timestamp,
	int,
	boolean,
	primaryKey,
	foreignKey,
	time,
	date,
	text,
	unique,
	check,
} from "drizzle-orm/mysql-core";
import {
	cinemaMoviesGenres,
	equipmentCategories,
	foodAddonCategories,
	foodAddonsItems,
	foodCategories,
	vrgamesCategories,
} from "./categories";
import { ID_GENERATOR_LENGTH } from "src/common/constants";
import { generateId } from "src/common/helpers";
import { relations, sql } from "drizzle-orm";
import { point } from "../customTypes";
import { countries } from "./countries";
import { smallint } from "drizzle-orm/mysql-core";

export type CreateFood = typeof foods.$inferInsert;
export type CreateVRGame = typeof vrgames.$inferInsert;
export type CreateVRGameAvailability = typeof vrgamesAvailability.$inferInsert;
export type CreateHotelAmenity = typeof hotelAmenities.$inferInsert;
export type CreateHotel = typeof hotels.$inferInsert;
export type CreateHotelRoom = typeof hotelRooms.$inferInsert;
export type CreateEquipmentRentals = typeof equipmentRentals.$inferInsert;
export type CreateCinema = typeof cinemas.$inferInsert;
export type CreateCinemaHall = typeof cinemaHalls.$inferInsert;
export type CreateCinemaMovie = typeof cinemaMovies.$inferInsert;
export type CreateCinemaMovieShowtime =
	typeof cinemaMoviesShowtimes.$inferInsert;
export type CreateSnack = typeof snacks.$inferInsert;
export type CreateMovieSnack = typeof moviesSnacks.$inferInsert;
export type CreateStudio = typeof studios.$inferInsert;
export type CreateStudioAvailability = typeof studioAvailability.$inferInsert;
export type CreateStudioSessionCart = typeof studioSessionCart.$inferInsert;
export type CreateEquipmentRentalCart =
	typeof equipmentRentalsCart.$inferInsert;
export type CreateVRGameTicketCart = typeof vrgamesTicketCart.$inferInsert;
export type CreateMovieTicketCart = typeof moviesTicketCart.$inferInsert;
export type CreateMovieTicketSnackCart =
	typeof moviesTicketSnacksCart.$inferInsert;
export type CreateHotelCart = typeof hotelCart.$inferInsert;
export type CreateFoodCart = typeof foodCart.$inferInsert;
export type CreateFoodCartAddon = typeof foodCartAddons.$inferInsert;

export const foods = mysqlTable("foods", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	description: varchar("description", { length: 1024 }),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	categoryId: int("category_id")
		.notNull()
		.references(() => foodCategories.id),
	imageUrls: json("image_urls")
		.$type<{ url: string; path: string }[]>()
		.default([])
		.notNull(),
	quantity: int("quantity").default(1).notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type FoodToAddonsCategories = typeof foodToAddonsCategories.$inferInsert;

export const foodToAddonsCategories = mysqlTable(
	"food_to_addons_categories",
	{
		foodId: varchar("food_id", { length: ID_GENERATOR_LENGTH })
			.notNull()
			.references(() => foods.id),
		addonCategoryId: int("addon_category_id").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.foodId, table.addonCategoryId] }),
		foreignKey({
			name: "fk_food_to_addon_category_id",
			columns: [table.addonCategoryId],
			foreignColumns: [foodAddonCategories.id],
		}),
	],
);

export type FoodToAddonsItems = typeof foodToAddonsItems.$inferInsert;

export const foodToAddonsItems = mysqlTable(
	"food_to_addons_items",
	{
		foodId: varchar("food_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		addonCategoryId: int("addon_category_id").notNull(),
		addonItemId: int("addon_item_id")
			.references(() => foodAddonsItems.id)
			.notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.foodId, table.addonItemId] }),

		foreignKey({
			name: "fk_food_to_addon_item_category_id",
			columns: [table.addonCategoryId],
			foreignColumns: [foodAddonCategories.id],
		}),

		foreignKey({
			name: "fk_food_to_addon_item_food_id_category_id",
			columns: [table.foodId, table.addonCategoryId],
			foreignColumns: [
				foodToAddonsCategories.foodId,
				foodToAddonsCategories.addonCategoryId,
			],
		}),

		foreignKey({
			name: "fk_food_to_addon_item_category_item_id",
			columns: [table.addonCategoryId, table.addonItemId],
			foreignColumns: [foodAddonsItems.categoryId, foodAddonsItems.id],
		}),
	],
);

export const foodsRelations = relations(foods, ({ one, many }) => ({
	category: one(foodCategories, {
		fields: [foods.categoryId],
		references: [foodCategories.id],
	}),
	addons: many(foodToAddonsCategories),
}));

export const foodAddonCategoriesRelations = relations(
	foodAddonCategories,
	({ many }) => ({
		items: many(foodAddonsItems),
		foodToAddonsCategories: many(foodToAddonsCategories),
	}),
);

export const foodAddonsItemsRelations = relations(
	foodAddonsItems,
	({ one }) => ({
		category: one(foodAddonCategories, {
			fields: [foodAddonsItems.categoryId],
			references: [foodAddonCategories.id],
		}),
	}),
);

export const foodToAddonsCategoriesRelations = relations(
	foodToAddonsCategories,
	({ one }) => ({
		food: one(foods, {
			fields: [foodToAddonsCategories.foodId],
			references: [foods.id],
		}),
		category: one(foodAddonCategories, {
			fields: [foodToAddonsCategories.addonCategoryId],
			references: [foodAddonCategories.id],
		}),
	}),
);

export const vrgames = mysqlTable("vrgames", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	description: varchar("description", { length: 1024 }),
	categoryId: int("category_id")
		.notNull()
		.references(() => vrgamesCategories.id),
	imageUrls: json("image_urls")
		.$type<{ url: string; path: string }[]>()
		.default([])
		.notNull(),
	ageRating: int("age_rating").default(0).notNull(),
	ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
	ticketQuantity: int("tikcet_quantity").default(1).notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const vrgamesRelations = relations(vrgames, ({ one, many }) => ({
	category: one(vrgamesCategories, {
		fields: [vrgames.categoryId],
		references: [vrgamesCategories.id],
	}),
	availability: many(vrgamesAvailability),
}));

export const vrgamesAvailability = mysqlTable(
	"vrgames_availability",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		vrgameId: varchar("vrgame_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		dayOfWeek: smallint("day_of_week").notNull(), // 0 (Sunday) to 6 (Saturday)
		startTime: time("start_time").notNull(),
		endTime: time("end_time").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_vrgames_availability_vrgame_id",
			columns: [table.vrgameId],
			foreignColumns: [vrgames.id],
		}).onDelete("cascade"),
		check(
			"chk_vrgames_availability_time",
			sql`${table.startTime} < ${table.endTime}`,
		),
		unique("uk_vrgames_availability_unique").on(
			table.vrgameId,
			table.dayOfWeek,
		),
		check(
			"chk_vrgames_availability_day_of_week",
			sql`${table.dayOfWeek} BETWEEN 0 AND 6`,
		),
	],
);

export const hotels = mysqlTable("hotels", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	description: varchar("description", { length: 1024 }),
	address: varchar("address", { length: 512 }).notNull(),
	city: varchar("city", { length: 255 }).notNull(),
	state: varchar("state", { length: 255 }).notNull(),
	country: varchar("country", { length: 255 }).notNull(),
	imageUrls: json("image_urls")
		.$type<{ url: string; path: string }[]>()
		.default([])
		.notNull(),
	rating: decimal("rating", { precision: 2, scale: 1 }).default("0").notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	coordinates: point("coordinates").notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const hotelRooms = mysqlTable("hotel_rooms", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	hotelId: varchar("hotel_id", { length: ID_GENERATOR_LENGTH })
		.notNull()
		.references(() => hotels.id, { onDelete: "cascade" }),
	name: varchar("name", { length: 255 }).notNull(),
	description: varchar("description", { length: 1024 }),
	pricePerNight: decimal("price_per_night", {
		precision: 10,
		scale: 2,
	}).notNull(),
	imageUrls: json("image_urls")
		.$type<{ url: string; path: string }[]>()
		.default([])
		.notNull(),
	capacity: int("capacity").default(1).notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const hotelAmenities = mysqlTable("hotel_amenities", {
	id: int("id").autoincrement().primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
	icon: varchar("icon", { length: 255 }).notNull(),
	iconPath: varchar("icon_path", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export const hotelToAmenities = mysqlTable(
	"hotel_to_amenities",
	{
		hotelId: varchar("hotel_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		amenityId: int("amenity_id").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.hotelId, table.amenityId] }),
		foreignKey({
			name: "fk_hotel_to_amenity_hotel_id",
			columns: [table.hotelId],
			foreignColumns: [hotels.id],
		}).onDelete("cascade"),
		foreignKey({
			name: "fk_hotel_to_amenity_amenity_id",
			columns: [table.amenityId],
			foreignColumns: [hotelAmenities.id],
		}).onDelete("cascade"),
	],
);

export const hotelRelations = relations(hotels, ({ many }) => ({
	rooms: many(hotelRooms),
	amenities: many(hotelToAmenities),
}));

export const hotelToAmenitiesRelations = relations(
	hotelToAmenities,
	({ one }) => ({
		amenity: one(hotelAmenities, {
			fields: [hotelToAmenities.amenityId],
			references: [hotelAmenities.id],
		}),
		hotel: one(hotels, {
			fields: [hotelToAmenities.hotelId],
			references: [hotels.id],
		}),
	}),
);

export const hotelRoomsRelations = relations(hotelRooms, ({ one }) => ({
	hotel: one(hotels, {
		fields: [hotelRooms.hotelId],
		references: [hotels.id],
	}),
}));

export const equipmentRentals = mysqlTable(
	"equipment_rentals",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		name: varchar("name", { length: 255 }).unique().notNull(),
		description: varchar("description", { length: 1024 }),
		categoryId: int("category_id").notNull(),
		imageUrls: json("image_urls")
			.$type<{ url: string; path: string }[]>()
			.default([])
			.notNull(),
		rentalPricePerDay: decimal("rental_price_per_day", {
			precision: 10,
			scale: 2,
		}).notNull(),
		address: varchar("address", { length: 512 }).notNull(),
		quantityAvailable: int("quantity_available").default(1).notNull(),
		isAvailable: boolean("is_available").default(false).notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_equipment_rentals_category_id",
			columns: [table.categoryId],
			foreignColumns: [equipmentCategories.id],
		}).onDelete("cascade"),
	],
);

export const equipmentRentalsRelation = relations(
	equipmentRentals,
	({ one }) => ({
		category: one(equipmentCategories, {
			fields: [equipmentRentals.categoryId],
			references: [equipmentCategories.id],
		}),
	}),
);

export const cinemas = mysqlTable("cinemas", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	address: varchar("address", { length: 512 }).notNull(),
	city: varchar("city", { length: 255 }).notNull(),
	state: varchar("state", { length: 255 }).notNull(),
	countryId: int("country_id")
		.references(() => countries.id)
		.notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const cinemaHalls = mysqlTable("cinema_halls", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	cinemaId: varchar("cinema_id", { length: ID_GENERATOR_LENGTH })
		.notNull()
		.references(() => cinemas.id, { onDelete: "cascade" }),
	name: varchar("name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const cinemaMovies = mysqlTable("cinema_movies", {
	id: varchar("id", { length: ID_GENERATOR_LENGTH })
		.$defaultFn(() => generateId())
		.primaryKey(),
	cinemaId: varchar("cinema_id", { length: ID_GENERATOR_LENGTH })
		.notNull()
		.references(() => cinemas.id, { onDelete: "cascade" }),
	title: varchar("title", { length: 255 }).unique().notNull(),
	description: varchar("description", { length: 1024 }),
	cast: text("cast"),
	durationMinutes: int("duration_minutes").notNull(),
	ageRating: int("age_rating").default(0).notNull(),
	posterUrl: varchar("poster_url", { length: 512 }),
	posterPath: varchar("poster_path", { length: 512 }),
	trailerUrl: text("trailer_url"),
	trailerPath: text("trailer_path"),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const cinemaMoviesToGenres = mysqlTable(
	"cinema_movies_to_genres",
	{
		movieId: varchar("movie_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		genreId: int("genre_id").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.movieId, table.genreId] }),
		foreignKey({
			name: "fk_cinema_movie_to_genre_movie_id",
			columns: [table.movieId],
			foreignColumns: [cinemaMovies.id],
		}).onDelete("cascade"),
		foreignKey({
			name: "fk_cinema_movie_to_genre_genre_id",
			columns: [table.genreId],
			foreignColumns: [cinemaMoviesGenres.id],
		}).onDelete("cascade"),
	],
);

export const cinemaMoviesShowtimes = mysqlTable(
	"cinema_movies_showtimes",
	{
		id: int("id").autoincrement().primaryKey(),
		movieId: varchar("movie_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		cinemaHallId: varchar("cinema_hall_id", {
			length: ID_GENERATOR_LENGTH,
		}).notNull(),
		showDate: date("show_date", { mode: "string" }).notNull(),
		showtime: time("showtime").notNull(),
		ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
		totalSeats: int("total_seats").default(100).notNull(),
		isAvailable: boolean("is_available").default(false).notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		foreignKey({
			name: "fk_cinema_movie_showtime_movie_id",
			columns: [table.movieId],
			foreignColumns: [cinemaMovies.id],
		}).onDelete("cascade"),
		foreignKey({
			name: "fk_cinema_movie_showtime_cinema_hall_id",
			columns: [table.cinemaHallId],
			foreignColumns: [cinemaHalls.id],
		}).onDelete("cascade"),
		unique("uk_cinema_movie_showtime_unique").on(
			table.movieId,
			table.cinemaHallId,
			table.showDate,
			table.showtime,
		),
	],
);

export const snacks = mysqlTable("snacks", {
	id: int("id").autoincrement().primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const moviesSnacks = mysqlTable(
	"movies_snacks",
	{
		movieId: varchar("movie_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		snackId: int("snack_id").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.movieId, table.snackId] }),
		foreignKey({
			name: "fk_movies_snacks_movie_id",
			columns: [table.movieId],
			foreignColumns: [cinemaMovies.id],
		}).onDelete("cascade"),
		foreignKey({
			name: "fk_movies_snacks_snack_id",
			columns: [table.snackId],
			foreignColumns: [snacks.id],
		}).onDelete("cascade"),
	],
);

export const cinemasRelations = relations(cinemas, ({ one, many }) => ({
	halls: many(cinemaHalls),
	movies: many(cinemaMovies),
	country: one(countries, {
		fields: [cinemas.countryId],
		references: [countries.id],
	}),
}));

export const cinemaHallsRelations = relations(cinemaHalls, ({ one, many }) => ({
	cinema: one(cinemas, {
		fields: [cinemaHalls.cinemaId],
		references: [cinemas.id],
	}),
	showtimes: many(cinemaMoviesShowtimes),
}));

export const cinemaMoviesRelations = relations(
	cinemaMovies,
	({ one, many }) => ({
		cinema: one(cinemas, {
			fields: [cinemaMovies.cinemaId],
			references: [cinemas.id],
		}),
		genres: many(cinemaMoviesToGenres),
		showtimes: many(cinemaMoviesShowtimes),
		snacks: many(moviesSnacks),
	}),
);

export const cinemaMoviesToGenresRelations = relations(
	cinemaMoviesToGenres,
	({ one }) => ({
		movie: one(cinemaMovies, {
			fields: [cinemaMoviesToGenres.movieId],
			references: [cinemaMovies.id],
		}),
		genre: one(cinemaMoviesGenres, {
			fields: [cinemaMoviesToGenres.genreId],
			references: [cinemaMoviesGenres.id],
		}),
	}),
);

export const cinemaMoviesShowtimesRelations = relations(
	cinemaMoviesShowtimes,
	({ one }) => ({
		movie: one(cinemaMovies, {
			fields: [cinemaMoviesShowtimes.movieId],
			references: [cinemaMovies.id],
		}),
		cinemaHall: one(cinemaHalls, {
			fields: [cinemaMoviesShowtimes.cinemaHallId],
			references: [cinemaHalls.id],
		}),
	}),
);

export const snacksRelations = relations(snacks, ({ many }) => ({
	movies: many(moviesSnacks),
	ticketPurchases: many(moviesTicketSnacksCart),
}));

export const moviesSnacksRelations = relations(moviesSnacks, ({ one }) => ({
	movie: one(cinemaMovies, {
		fields: [moviesSnacks.movieId],
		references: [cinemaMovies.id],
	}),
	snack: one(snacks, {
		fields: [moviesSnacks.snackId],
		references: [snacks.id],
	}),
}));

export const studios = mysqlTable("studios", {
	id: int("id").autoincrement().primaryKey(),
	name: varchar("name", { length: 255 }).unique().notNull(),
	location: varchar("location", { length: 512 }).notNull(),
	imageUrls: json("image_urls")
		.$type<{ url: string; path: string }[]>()
		.default([])
		.notNull(),
	hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
	isAvailable: boolean("is_available").default(false).notNull(),
	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 6 })
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export const studioAvailability = mysqlTable(
	"studios_availability",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		studioId: int("studio_id")
			.notNull()
			.references(() => studios.id),
		dayOfWeek: smallint("day_of_week").notNull(), // 0 (Sunday) to 6 (Saturday)
		startTime: time("start_time").notNull(),
		endTime: time("end_time").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_studio_availability_studio_id",
			columns: [table.studioId],
			foreignColumns: [studios.id],
		}).onDelete("cascade"),
		check(
			"chk_studio_availability_time",
			sql`${table.startTime} < ${table.endTime}`,
		),
		unique("uk_studio_availability_unique").on(table.studioId, table.dayOfWeek),
		check(
			"chk_studio_availability_day_of_week",
			sql`${table.dayOfWeek} BETWEEN 0 AND 6`,
		),
	],
);

export const studioSessionCart = mysqlTable(
	"studio_session_cart",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		studioId: int("studio_id")
			.notNull()
			.references(() => studios.id),
		userId: varchar("user_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		bookingDate: date("booking_date", { mode: "string" }).notNull(),
		startTime: time("start_time").notNull(),
		endTime: time("end_time").notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		status: varchar("status", { length: 50 })
			.default("pending")
			.notNull()
			.$type<"pending" | "scheduled" | "cancelled" | "completed">(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_studio_session_cart_studio_id",
			columns: [table.studioId],
			foreignColumns: [studios.id],
		}).onDelete("cascade"),
		check(
			"chk_studio_session_cart_time",
			sql`${table.startTime} < ${table.endTime}`,
		),
		check(
			"chk_studio_session_cart_status",
			sql`${table.status} IN ('pending', 'confirmed', 'cancelled', 'completed')`,
		),
	],
);

export const studiosRelations = relations(studios, ({ many }) => ({
	availability: many(studioAvailability),
	carts: many(studioSessionCart),
}));

export const studioSessionCartRelations = relations(
	studioSessionCart,
	({ one }) => ({
		studio: one(studios, {
			fields: [studioSessionCart.studioId],
			references: [studios.id],
		}),
	}),
);

export const equipmentRentalsCart = mysqlTable(
	"equipment_rentals_cart",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		equipmentRentalId: varchar("equipment_rental_id", {
			length: ID_GENERATOR_LENGTH,
		}).notNull(),
		userId: varchar("user_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		rentalStartDate: date("rental_start_date", { mode: "string" }).notNull(),
		rentalEndDate: date("rental_end_date", { mode: "string" }).notNull(),
		quantity: int("quantity").default(1).notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		status: varchar("status", { length: 50 })
			.default("pending")
			.notNull()
			.$type<"pending" | "ongoing" | "cancelled" | "completed">(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_equipment_rentals_cart_equipment_rental_id",
			columns: [table.equipmentRentalId],
			foreignColumns: [equipmentRentals.id],
		}).onDelete("set null"),
		check(
			"chk_equipment_rentals_cart_dates",
			sql`${table.rentalStartDate} <= ${table.rentalEndDate}`,
		),
		check(
			"chk_equipment_rentals_cart_status",
			sql`${table.status} IN ('pending', 'ongoing', 'cancelled', 'completed')`,
		),
		unique("uk_equipment_rentals_cart_unique").on(
			table.equipmentRentalId,
			table.userId,
			table.rentalStartDate,
			table.rentalEndDate,
		),
	],
);

export const equipmentRentalsCartRelations = relations(
	equipmentRentalsCart,
	({ one }) => ({
		equipmentRental: one(equipmentRentals, {
			fields: [equipmentRentalsCart.equipmentRentalId],
			references: [equipmentRentals.id],
		}),
	}),
);

export const vrgamesTicketCart = mysqlTable(
	"vrgames_ticket_cart",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		vrgameId: varchar("vrgame_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		userId: varchar("user_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		ticketQuantity: int("ticket_quantity").default(1).notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		status: varchar("status", { length: 50 })
			.$type<"pending" | "completed" | "cancelled">()
			.default("pending")
			.notNull(),
		scheduledDate: date("scheduled_date", { mode: "string" }).notNull(),
		scheduledTime: time("scheduled_time").notNull(),
		purchaseDate: timestamp("purchase_date", { fsp: 6 }).defaultNow().notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_vrgames_ticket_cart_vrgame_id",
			columns: [table.vrgameId],
			foreignColumns: [vrgames.id],
		}).onDelete("cascade"),
		check(
			"chk_vrgames_ticket_cart_status",
			sql`${table.status} IN ('pending', 'completed', 'cancelled')`,
		),
	],
);

export const vrgamesTicketCartRelations = relations(
	vrgamesTicketCart,
	({ one }) => ({
		vrgame: one(vrgames, {
			fields: [vrgamesTicketCart.vrgameId],
			references: [vrgames.id],
		}),
	}),
);

export const moviesTicketCart = mysqlTable(
	"movies_ticket_cart",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		showtimeId: int("showtime_id").notNull(),
		userId: varchar("user_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		ticketQuantity: int("ticket_quantity").default(1).notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		status: varchar("status", { length: 50 })
			.$type<"pending" | "completed" | "cancelled">()
			.default("pending")
			.notNull(),
		purchaseDate: timestamp("purchase_date", {
			fsp: 6,
			mode: "string",
		}),
		createdAt: timestamp("created_at", { fsp: 6, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_movies_ticket_cart_showtime_id",
			columns: [table.showtimeId],
			foreignColumns: [cinemaMoviesShowtimes.id],
		}).onDelete("cascade"),
		check(
			"chk_movies_ticket_cart_status",
			sql`${table.status} IN ('pending', 'completed', 'cancelled')`,
		),
	],
);

export const moviesTicketSnacksCart = mysqlTable(
	"movies_ticket_snacks_cart",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		ticketCartId: varchar("ticket_cart_id", {
			length: ID_GENERATOR_LENGTH,
		}).notNull(),
		snackId: int("snack_id").notNull(),
		quantity: int("quantity").default(1).notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_movies_ticket_snacks_cart_ticket_cart_id",
			columns: [table.ticketCartId],
			foreignColumns: [moviesTicketCart.id],
		}).onDelete("cascade"),
		foreignKey({
			name: "fk_movies_ticket_snacks_cart_snack_id",
			columns: [table.snackId],
			foreignColumns: [snacks.id],
		}).onDelete("cascade"),
	],
);

export const moviesTicketCartRelations = relations(
	moviesTicketCart,
	({ one, many }) => ({
		showtime: one(cinemaMoviesShowtimes, {
			fields: [moviesTicketCart.showtimeId],
			references: [cinemaMoviesShowtimes.id],
		}),
		orderedSnacks: many(moviesTicketSnacksCart),
	}),
);

export const moviesTicketSnacksCartRelations = relations(
	moviesTicketSnacksCart,
	({ one }) => ({
		ticketCart: one(moviesTicketCart, {
			fields: [moviesTicketSnacksCart.ticketCartId],
			references: [moviesTicketCart.id],
		}),
		snack: one(snacks, {
			fields: [moviesTicketSnacksCart.snackId],
			references: [snacks.id],
		}),
	}),
);

export const hotelCart = mysqlTable(
	"hotel_cart",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: varchar("user_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		hotelId: varchar("hotel_id", {
			length: ID_GENERATOR_LENGTH,
		}),
		hotelRoomId: varchar("hotel_room_id", {
			length: ID_GENERATOR_LENGTH,
		}).notNull(),
		checkInDate: date("check_in_date", { mode: "string" }).notNull(),
		checkOutDate: date("check_out_date", { mode: "string" }).notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		status: varchar("status", { length: 50 })
			.default("pending")
			.notNull()
			.$type<"pending" | "confirmed" | "cancelled" | "completed">(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_hotel_cart_hotel_id",
			columns: [table.hotelId],
			foreignColumns: [hotels.id],
		}).onDelete("no action"),
		check(
			"chk_hotel_cart_dates",
			sql`${table.checkInDate} < ${table.checkOutDate}`,
		),
		check(
			"chk_hotel_cart_status",
			sql`${table.status} IN ('pending', 'confirmed', 'cancelled', 'completed')`,
		),
	],
);

export const hotelCartRelations = relations(hotelCart, ({ one }) => ({
	hotel: one(hotels, {
		fields: [hotelCart.hotelId],
		references: [hotels.id],
	}),
	hotelRoom: one(hotelRooms, {
		fields: [hotelCart.hotelRoomId],
		references: [hotelRooms.id],
	}),
}));

export const foodCart = mysqlTable(
	"food_cart",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: varchar("user_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		foodId: varchar("food_id", { length: ID_GENERATOR_LENGTH }).notNull(),
		quantity: int("quantity").default(1).notNull(),
		totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
		orderDate: timestamp("order_date", { fsp: 6 }),
		deliveryType: varchar("delivery_type", { length: 50 })
			.$type<"pickup" | "delivery">()
			.notNull(),
		deliveryAddress: varchar("delivery_address", { length: 512 }),
		deliveryLng: decimal("delivery_longitude", {
			precision: 10,
			scale: 2,
		}),
		deliveryLat: decimal("delivery_latitude", {
			precision: 10,
			scale: 2,
		}),
		specialInstructions: varchar("special_instructions", { length: 1024 }),
		status: varchar("status", { length: 50 })
			.default("pending")
			.notNull()
			.$type<
				| "pending"
				| "preparing"
				| "delivered"
				| "cancelled"
				| "confirmed"
				| "on-the-way"
			>(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_food_cart_food_id",
			columns: [table.foodId],
			foreignColumns: [foods.id],
		}).onDelete("cascade"),
		check(
			"chk_food_cart_delivery_type",
			sql`${table.deliveryType} IN ('pickup', 'delivery')`,
		),
		check(
			"chk_food_cart_status",
			sql`${table.status} IN ('pending', 'preparing', 'delivered', 'cancelled')`,
		),
	],
);

export const foodCartAddons = mysqlTable(
	"food_cart_addons",
	{
		id: varchar("id", { length: ID_GENERATOR_LENGTH })
			.$defaultFn(() => generateId())
			.primaryKey(),
		foodCartId: varchar("food_cart_id", {
			length: ID_GENERATOR_LENGTH,
		}).notNull(),
		addonCategoryId: int("addon_category_id").notNull(),
		addonItemId: int("addon_item_id").notNull(),
		createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 6 })
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		foreignKey({
			name: "fk_food_cart_addons_food_cart_id",
			columns: [table.foodCartId],
			foreignColumns: [foodCart.id],
		}).onDelete("cascade"),
		foreignKey({
			name: "fk_food_cart_addons_addon_category_id",
			columns: [table.addonCategoryId],
			foreignColumns: [foodAddonCategories.id],
		}).onDelete("cascade"),
		foreignKey({
			name: "fk_food_cart_addons_addon_item_id",
			columns: [table.addonItemId],
			foreignColumns: [foodAddonsItems.id],
		}).onDelete("cascade"),
	],
);

export const foodCartRelations = relations(foodCart, ({ one, many }) => ({
	food: one(foods, {
		fields: [foodCart.foodId],
		references: [foods.id],
	}),
	foodAddons: many(foodCartAddons),
}));

export const foodCartAddonsRelations = relations(foodCartAddons, ({ one }) => ({
	foodCart: one(foodCart, {
		fields: [foodCartAddons.foodCartId],
		references: [foodCart.id],
	}),
	addonCategory: one(foodAddonCategories, {
		fields: [foodCartAddons.addonCategoryId],
		references: [foodAddonCategories.id],
	}),
	addonItem: one(foodAddonsItems, {
		fields: [foodCartAddons.addonItemId],
		references: [foodAddonsItems.id],
	}),
}));

// export const foodBookings = mysqlTable("food_bookings", {
// 	id: varchar("id", { length: ID_GENERATOR_LENGTH })
// 		.$defaultFn(() => generateId())
// 		.primaryKey(),
// 	userId: varchar("user_id", { length: ID_GENERATOR_LENGTH }).notNull(),
// 	foodItems: json("food_items")
// 		.$type<
// 			{
// 				foodId: string;
// 				quantity: number;
// 				addons?: { addonCategoryId: number; addonItemIds: number[] }[];
// 			}[]
// 		>()
// 		.notNull(),
// 	totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
// 	bookingDate: timestamp("booking_date", { fsp: 6 }).defaultNow().notNull(),
// 	status: varchar("status", { length: 50 })
// 		.default("pending")
// 		.notNull()
// 		.$type<"pending" | "preparing" | "delivered" | "cancelled">(),
// 	createdAt: timestamp("created_at", { fsp: 6 }).defaultNow().notNull(),
// 	updatedAt: timestamp("updated_at", { fsp: 6 })
// 		.$onUpdateFn(() => new Date())
// 		.notNull(),
// });
