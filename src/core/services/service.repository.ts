import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import {
	advertBanners,
	foodAddonCategories,
	foodAddonsItems,
	foodCategories,
	foods,
	foodToAddonsCategories,
	hotels,
	vrgames,
	vrgamesCategories,
} from "src/database/schema";

@Injectable()
export class ServicesRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async getFoodCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(foodCategories)
			.limit(limit)
			.offset(offset);

		return categories;
	}

	async getFoodById(id: string) {
		const food = await this.databaseService.db.query.foods.findFirst({
			where: eq(foods.id, id),
			with: {
				category: {
					columns: {
						createdAt: false,
						updatedAt: false,
					},
				},
				addons: {
					columns: {
						createdAt: false,
						updatedAt: false,
						foodId: false,
						addonCategoryId: false,
					},
					with: {
						category: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
							with: {
								items: {
									columns: {
										createdAt: false,
										updatedAt: false,
									},
								},
							},
						},
					},
				},
			},
		});

		return {
			...food,
			addons: food?.addons.map((addon) => ({
				...addon.category,
				items: addon.category.items,
			})),
		};
	}

	async getAllFoods({
		offset,
		limit,
		categoryId,
		search,
	}: { offset: number; limit: number; categoryId?: number; search?: string }) {
		// Old way using relations (Didn't work with mariadb on cpanel)
		// const result = await this.databaseService.db.query.foods.findMany({
		// 	where: (foods, { and, like }) =>
		// 		and(
		// 			categoryId ? eq(foods.categoryId, categoryId) : undefined,
		// 			search ? like(foods.name, `%${search}%`) : undefined,
		// 			eq(foods.isAvailable, true),
		// 		),
		// 	with: {
		// 		category: {
		// 			columns: {
		// 				createdAt: false,
		// 				updatedAt: false,
		// 			},
		// 		},
		// 		addons: {
		// 			columns: {
		// 				createdAt: false,
		// 				updatedAt: false,
		// 				foodId: false,
		// 				addonCategoryId: false,
		// 			},
		// 			with: {
		// 				category: {
		// 					columns: {
		// 						createdAt: false,
		// 						updatedAt: false,
		// 					},
		// 					with: {
		// 						items: {
		// 							columns: {
		// 								createdAt: false,
		// 								updatedAt: false,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// 	limit,
		// 	offset,
		// 	orderBy: (foods, { desc }) => [desc(foods.createdAt)],
		// });

		const result = await this.databaseService.db
			.select({
				id: foods.id,
				name: foods.name,
				description: foods.description,
				price: foods.price,
				imageUrls: foods.imageUrls,
				categoryId: foods.categoryId,
				isAvailable: foods.isAvailable,
				category: {
					id: foodCategories.id,
					name: foodCategories.name,
				},
				addons: sql<{
					id: string;
					name: string;
					items: { id: string; name: string; price: number }[];
				}>`CASE 
    WHEN COUNT(${foodAddonCategories.id}) = 0 
    THEN JSON_ARRAY()
    ELSE JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', ${foodAddonCategories.id},
            'name', ${foodAddonCategories.name},
            'description', ${foodAddonCategories.description},
            'items', COALESCE((
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', items.id,
                        'name', items.name,
                        'price', items.price
                    )
                )
                FROM ${foodAddonsItems} AS items
                WHERE items.category_id = ${foodAddonCategories.id}
            ), JSON_ARRAY())
        )
    )
END`.as("addons"),
			})
			.from(foods)
			.leftJoin(foodCategories, eq(foods.categoryId, foodCategories.id))
			.leftJoin(
				foodToAddonsCategories,
				eq(foodToAddonsCategories.foodId, foods.id),
			)
			.leftJoin(
				foodAddonCategories,
				eq(foodToAddonsCategories.addonCategoryId, foodAddonCategories.id),
			)
			.where(
				and(
					categoryId ? eq(foods.categoryId, categoryId) : undefined,
					search ? like(foods.name, `%${search}%`) : undefined,
					eq(foods.isAvailable, true),
				),
			)
			.groupBy(foods.id, foodCategories.id, foodCategories.name)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(foods.createdAt));

		return result;
	}

	async getAllAdvertBanners(offset: number, limit: number) {
		const banners = await this.databaseService.db
			.select()
			.from(advertBanners)
			.where(eq(advertBanners.isPublished, true))
			.limit(limit)
			.offset(offset)
			.orderBy(desc(advertBanners.createdAt));

		return banners;
	}

	async getAllVrGameCategories(offset: number, limit: number) {
		const categories = await this.databaseService.db
			.select()
			.from(vrgamesCategories)
			.limit(limit)
			.offset(offset)
			.orderBy(asc(vrgamesCategories.id));

		return categories;
	}

	async getVrGames({
		offset,
		limit,
		categoryId,
		search,
	}: { offset: number; limit: number; categoryId?: number; search?: string }) {
		const vrgamesList = this.databaseService.db
			.select()
			.from(vrgames)
			.where(
				and(
					categoryId ? eq(vrgames.categoryId, categoryId) : undefined,
					search ? like(vrgames.name, `%${search}%`) : undefined,
					eq(vrgames.isAvailable, true),
				),
			)
			.limit(limit)
			.offset(offset);

		return vrgamesList;
	}

	async getVrGameById(id: string) {
		const vrgame = await this.databaseService.db
			.select()
			.from(vrgames)
			.where(and(eq(vrgames.id, id), eq(vrgames.isAvailable, true)))
			.limit(1);

		return vrgame;
	}

	async getAllHotelAmenities(offset: number, limit: number) {
		const amenities = await this.databaseService.db
			.select()
			.from(sql`hotel_amenities`)
			.limit(limit)
			.offset(offset)
			.orderBy(asc(sql`id`));

		return amenities;
	}

	async getHotelById(id: string) {
		const hotel = await this.databaseService.db.query.hotels.findFirst({
			where: eq(hotels.id, id),
			with: {
				rooms: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
					},
				},
				amenities: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
						amenityId: false,
					},
					with: {
						amenity: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
						},
					},
				},
			},
		});

		const formattedHotel = hotel && {
			...hotel,
			amenities: hotel.amenities.map((a) => a.amenity),
		};

		return formattedHotel;
	}

	async getHotels({
		offset,
		limit,
		search,
		coordinates,
		radiusInKm,
	}: {
		offset: number;
		limit: number;
		search?: string;
		coordinates?: { lat?: number; lon?: number };
		radiusInKm?: number;
	}) {
		const hotelsList = await this.databaseService.db.query.hotels.findMany({
			where: (hotels, { and, like }) =>
				and(
					search ? like(hotels.name, `%${search}%`) : undefined,
					eq(hotels.isAvailable, true),
					coordinates?.lat && coordinates.lon && radiusInKm
						? sql`ST_Distance_Sphere(${hotels.coordinates}, ST_GeomFromText('POINT(${coordinates.lat} ${coordinates.lon})',4326)) <= ${radiusInKm * 1000}`
						: undefined,
				),
			columns: {
				createdAt: false,
				updatedAt: false,
			},
			with: {
				rooms: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
					},
				},
				amenities: {
					columns: {
						createdAt: false,
						updatedAt: false,
						hotelId: false,
						amenityId: false,
					},
					with: {
						amenity: {
							columns: {
								createdAt: false,
								updatedAt: false,
							},
						},
					},
				},
			},
			limit,
			offset,
			orderBy: (hotels, { desc }) => [desc(hotels.createdAt)],
		});

		const formattedHotels = hotelsList.map((hotel) => ({
			...hotel,
			amenities: hotel.amenities.map((a) => a.amenity),
		}));

		return formattedHotels;
	}
}
