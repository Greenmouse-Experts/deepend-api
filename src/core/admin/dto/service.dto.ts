import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";
import { timeToMinutes } from "src/common/helpers";

export const timePattern = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

class Images {
	@ApiProperty({
		example: "http://example.com/image.jpg",
		description: "URL of the image",
	})
	url: string;

	@ApiProperty({
		example: "/images/image.jpg",
		description: "Path of the image",
	})
	path: string;
}

export class CreateFoodDto {
	@ApiProperty({ example: "Pizza", description: "Name of the food item" })
	name: string;

	@ApiProperty({
		example: "Delicious cheese pizza",
		description: "Description of the food item",
		required: false,
	})
	description?: string;

	@ApiProperty({ example: 9.99, description: "Price of the food item" })
	price: string;

	@ApiProperty({ example: 10, description: "Quantity of the food item" })
	quantity: number;

	@ApiProperty({ example: 1, description: "Category ID of the food item" })
	categoryId: number;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the food item",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];
}

export const CreateFoodSchema = Joi.object({
	name: Joi.string().max(255).trim().required(),
	description: Joi.string().max(1024).optional(),
	price: Joi.number().precision(2).positive().required(),
	quantity: Joi.number().integer().min(1).required(),
	categoryId: Joi.number().integer().positive().required(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.optional(),
});

export class UpdateFoodDto {
	@ApiProperty({
		example: "Pizza",
		description: "Name of the food item",
		required: false,
	})
	name?: string;

	@ApiProperty({
		example: "Delicious cheese pizza",
		description: "Description of the food item",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: 9.99,
		description: "Price of the food item",
		required: false,
	})
	price?: string;

	@ApiProperty({
		example: 10,
		description: "Quantity of the food item",
		required: true,
	})
	quantity: number;

	@ApiProperty({
		example: 1,
		description: "Category ID of the food item",
		required: false,
	})
	categoryId?: number;

	@ApiProperty({
		example: [
			{
				url: "http://example.com/image1.jpg",
				path: "/image1.jpeg",
			},
		],
		description: "List of image URLs for the food item",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];
}

export const UpdateFoodSchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	description: Joi.string().max(1024).optional(),
	price: Joi.number().precision(2).positive().optional(),
	quantity: Joi.number().integer().min(1).required(),
	categoryId: Joi.number().integer().positive().optional(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.optional(),
});

export class AddFoodAddonItems {
	@ApiProperty({ example: 1, description: "Addon Category ID" })
	addonCategoryId: number;
	@ApiProperty({ example: 1, description: "Addon Item ID" })
	addonItemId: number;
}

export class AddFoodAddonsDto {
	@ApiProperty({
		type: [AddFoodAddonItems],
		description: "List of addon items to be added",
	})
	addons: AddFoodAddonItems[];
}

export const AddFoodAddonItemsSchema = Joi.object({
	addons: Joi.array().items({
		addonCategoryId: Joi.number().integer().positive().required(),
		addonItemId: Joi.number().integer().positive().required(),
	}),
})
	.min(1)
	.required();

export class RemoveFoodAddonCategoryDto {
	@ApiProperty({
		example: [1, 2],
		description: "List of addon category IDs to be removed",
	})
	addonCategoryIds: number[];
}

export const RemoveFoodAddonCategorySchema = Joi.object({
	addonCategoryIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});

export class RemoveFoodAddonItemsDto {
	@ApiProperty({
		example: [1, 2],
		description: "List of addon item IDs to be removed",
	})
	addonItemIds: number[];
}

export const RemoveFoodAddonItemsSchema = Joi.object({
	addonItemIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});

export class CreateAdvertBannerDto {
	@ApiProperty({
		description: "Name of advert banner",
		example: "Spider ads",
		required: true,
	})
	name: string;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the advert.",
		required: true,
		type: [Images],
	})
	imageUrls: Images[];

	@ApiProperty({
		example: "http://example.com/banner",
		description: "Link to the advert banner source page",
		required: true,
	})
	linkUrl: string;
}

export const CreateAdvertBannerSchema = Joi.object({
	name: Joi.string().max(124).required(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().trim().required(),
			}),
		)
		.required(),
	linkUrl: Joi.string().uri().required(),
});

export class UpdateAdvertBannerDto {
	@ApiProperty({
		description: "Name of advert banner",
		example: "Spider ads",
		required: false,
	})
	name?: string;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the advert.",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({
		example: "http://example.com/banner",
		description: "Link to the advert banner source page",
		required: true,
	})
	linkUrl?: string;
}

export const UpdateAdvertBannerSchema = Joi.object({
	name: Joi.string().max(124).optional(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().trim().required(),
			}),
		)
		.optional(),
	linkUrl: Joi.string().uri().optional(),
});

export class CreateVRGameDto {
	@ApiProperty({ example: "Beat Saber", description: "Name of the VR game" })
	name: string;

	@ApiProperty({
		example: "A rhythm-based VR game",
		description: "Description of the VR game",
		required: false,
	})
	description?: string;

	@ApiProperty({ example: 1, description: "Category ID of the VR game" })
	categoryId: number;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the VR game",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({ example: 12, description: "Age rating for the VR game" })
	ageRating: number;

	@ApiProperty({ example: 15.0, description: "Ticket price for the VR game" })
	ticketPrice: string;

	@ApiProperty({ example: 5, description: "Ticket quantity available" })
	ticketQuantity: number;
}

export const CreateVRGameSchema = Joi.object({
	name: Joi.string().max(255).trim().required(),
	description: Joi.string().max(1024).optional(),
	categoryId: Joi.number().integer().positive().required(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.required(),
	ageRating: Joi.number().integer().min(0).max(100).required(),
	ticketPrice: Joi.number().precision(2).positive().required(),
	ticketQuantity: Joi.number().integer().min(1).required(),
});

export class UpdateVRGameDto {
	@ApiProperty({
		example: "Beat Saber",
		description: "Name of the VR game",
		required: false,
	})
	name?: string;

	@ApiProperty({
		example: "A rhythm-based VR game",
		description: "Description of the VR game",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: 1,
		description: "Category ID of the VR game",
		required: false,
	})
	categoryId?: number;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the VR game",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({
		example: 12,
		description: "Age rating for the VR game",
		required: false,
	})
	ageRating?: number;

	@ApiProperty({
		example: 15.0,
		description: "Ticket price for the VR game",
		required: false,
	})
	ticketPrice?: string;

	@ApiProperty({
		example: 5,
		description: "Ticket quantity available",
		required: true,
	})
	ticketQuantity: number;
}

export const UpdateVRGameSchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	description: Joi.string().max(1024).optional(),
	categoryId: Joi.number().integer().positive().optional(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.optional(),
	ageRating: Joi.number().integer().min(0).max(100).optional(),
	ticketPrice: Joi.number().precision(2).positive().optional(),
	ticketQuantity: Joi.number().integer().min(1).required(),
});

export class CreateVrgameAvailabilityDto {
	@ApiProperty({
		example: "iijjaljdfaijfd",
		description: "ID of the VR game",
	})
	vrGameId: string;

	@ApiProperty({
		example: 1,
		description: "Day of the week (0=Sunday, 1=Monday, ..., 6=Saturday)",
	})
	dayOfWeek: number;

	@ApiProperty({
		example: "09:00",
		description: "Start time of availability (HH:mm format)",
	})
	startTime: string;

	@ApiProperty({
		example: "17:00",
		description: "End time of availability (HH:mm format)",
	})
	endTime: string;
}

export const CreateVrgameAvailabilitySchema = Joi.object({
	vrGameId: Joi.string().required(),
	dayOfWeek: Joi.number().integer().min(0).max(6).required(),
	startTime: Joi.string().pattern(timePattern).required(),
	endTime: Joi.string().pattern(timePattern).required(),
}).custom((value, helpers) => {
	const { startTime, endTime } = value;

	if (startTime && endTime) {
		if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
			return helpers.error("time.endBeforeStart");
		}
	}

	return value;
});

export class RemoveVrgameAvailabilityDto {
	@ApiProperty({
		example: ["iijjaljdfaijfd", "aidfaljfdlaj", "iosadjfjasldfj"],
		description: "IDs of the vrgame availability entry to be removed",
	})
	availabilityIds: string[];
}

export const RemoveVrgameAvailabilitySchema = Joi.object({
	availabilityIds: Joi.array()
		.items(Joi.string().trim().required())
		.min(1)
		.required(),
});

export class CreateHotelAmenityDto {
	@ApiProperty({ example: "Free WiFi", description: "Name of the amenity" })
	name: string;

	@ApiProperty({
		example: "wifi",
		description: "Icon name for the amenity",
	})
	icon: string;

	@ApiProperty({
		example: "/icons/wifi.png",
		description: "Path to the icon image",
	})
	iconPath: string;
}

export class CreateHotelAmenitiesDto {
	@ApiProperty({
		type: [CreateHotelAmenityDto],
		description: "List of hotel amenities to be added",
	})
	amenities: CreateHotelAmenityDto[];
}

export const CreateHotelAmenitiesSchema = Joi.object({
	amenities: Joi.array()
		.items(
			Joi.object({
				name: Joi.string().max(255).trim().required(),
				icon: Joi.string().max(255).trim().required(),
				iconPath: Joi.string().trim().required(),
			}),
		)
		.min(1)
		.required(),
});

export class UpdateHotelAmenityDto {
	@ApiProperty({
		example: "Free WiFi",
		description: "Name of the amenity",
		required: false,
	})
	name?: string;

	@ApiProperty({
		example: "wifi",
		description: "Icon name for the amenity",
		required: false,
	})
	icon?: string;

	@ApiProperty({
		example: "/icons/wifi.png",
		description: "Path to the icon image",
		required: false,
	})
	iconPath?: string;
}

export const UpdateHotelAmenitySchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	icon: Joi.string().max(255).trim().optional(),
	iconPath: Joi.string().trim().optional(),
});

export class CreateHotelRoomDto {
	@ApiProperty({ example: "Deluxe Room", description: "Name of the room" })
	name: string;

	@ApiProperty({
		example: "A spacious deluxe room with sea view",
		description: "Description of the room",
		required: false,
	})
	description?: string;

	@ApiProperty({ example: 150.0, description: "Price per night for the room" })
	pricePerNight: string;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the room",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({ example: 2, description: "Capacity of the room" })
	capacity: number;
}

export class CreateHotelDto {
	@ApiProperty({ example: "Grand Hotel", description: "Name of the hotel" })
	name: string;

	@ApiProperty({
		example: "A luxurious hotel in the city center",
		description: "Description of the hotel",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: "New York",
		description: "City where the hotel is located",
	})
	city: string;

	@ApiProperty({
		example: "California",
		description: "State where the hotel is located",
	})
	state: string;

	@ApiProperty({
		example: "USA",
		description: "Country where the hotel is located",
	})
	country: string;

	@ApiProperty({ example: "123 Main St", description: "Address of the hotel" })
	address: string;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the hotel",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({
		example: 40.7128,
		description: "Latitude coordinate of the hotel",
	})
	latitude: number;

	@ApiProperty({
		example: -74.006,
		description: "Longitude coordinate of the hotel",
	})
	longitude: number;
}

export const CreateHotelSchema = Joi.object({
	name: Joi.string().max(255).trim().required(),
	description: Joi.string().max(1024).required(),
	city: Joi.string().max(255).trim().required(),
	state: Joi.string().max(255).trim().required(),
	country: Joi.string().max(255).trim().required(),
	address: Joi.string().max(512).trim().required(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.required(),
	latitude: Joi.number().min(-90).max(90).required(),
	longitude: Joi.number().min(-180).max(180).required(),
});

export const CreateHotelRoomSchema = Joi.object({
	name: Joi.string().max(255).trim().required(),
	description: Joi.string().max(1024).optional(),
	pricePerNight: Joi.number().precision(2).positive().required(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.optional(),
	capacity: Joi.number().integer().min(1).required(),
});

export class UpdateHotelDto {
	@ApiProperty({
		example: "Grand Hotel",
		description: "Name of the hotel",
		required: false,
	})
	name?: string;

	@ApiProperty({
		example: "A luxurious hotel in the city center",
		description: "Description of the hotel",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: "New York",
		description: "City where the hotel is located",
		required: false,
	})
	city?: string;

	@ApiProperty({
		example: "California",
		description: "State where the hotel is located",
		required: false,
	})
	state?: string;

	@ApiProperty({
		example: "USA",
		description: "Country where the hotel is located",
		required: false,
	})
	country?: string;

	@ApiProperty({
		example: "123 Main St",
		description: "Address of the hotel",
		required: false,
	})
	address?: string;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the hotel",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({
		example: 40.7128,
		description: "Latitude coordinate of the hotel",
		required: false,
	})
	latitude?: number;

	@ApiProperty({
		example: -74.006,
		description: "Longitude coordinate of the hotel",
		required: false,
	})
	longitude?: number;
}

export const UpdateHotelSchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	description: Joi.string().max(1024).optional(),
	city: Joi.string().max(255).trim().optional(),
	state: Joi.string().max(255).trim().optional(),
	country: Joi.string().max(255).trim().optional(),
	address: Joi.string().max(512).trim().optional(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.optional(),
	latitude: Joi.number().min(-90).max(90).optional(),
	longitude: Joi.number().min(-180).max(180).optional(),
});

export class AddHotelAmenitiesDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: "List of amenity IDs to be added to the hotel",
	})
	amenityIds: number[];
}

export class UpdateHotelRoomDto {
	@ApiProperty({
		example: "Deluxe Room",
		description: "Name of the room",
		required: false,
	})
	name?: string;

	@ApiProperty({
		example: "A spacious deluxe room with sea view",
		description: "Description of the room",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: 150.0,
		description: "Price per night for the room",
		required: false,
	})
	pricePerNight?: string;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the room",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({
		example: 2,
		description: "Capacity of the room",
		required: true,
	})
	capacity: number;
}

export const UpdateHotelRoomSchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	description: Joi.string().max(1024).optional(),
	pricePerNight: Joi.number().precision(2).positive().optional(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.optional(),
	capacity: Joi.number().integer().min(1).required(),
});

export const AddHotelAmenitiesSchema = Joi.object({
	amenityIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});

export class RemoveHotelAmenitiesDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: "List of amenity IDs to be removed from the hotel",
	})
	amenityIds: number[];
}

export const RemoveHotelAmenitiesSchema = Joi.object({
	amenityIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});

export class CreateEquipmentRentalDto {
	@ApiProperty({ example: "Camera", description: "Name of the equipment" })
	name: string;

	@ApiProperty({
		example: "High-quality DSLR camera",
		description: "Description of the equipment",
		required: false,
	})
	description?: string;

	@ApiProperty({ example: 1, description: "Category ID of the equipment" })
	categoryId: number;

	@ApiProperty({ example: 50.0, description: "Rental price per day" })
	rentalPricePerDay: string;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the equipment",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({
		example: 10,
		description: "Quantity of the equipment available",
	})
	quantityAvailable: number;

	@ApiProperty({
		example: "123 Main St, City, Country",
		description: "Address where the equipment can be picked up",
	})
	address: string;
}

export const CreateEquipmentRentalSchema = Joi.object({
	name: Joi.string().max(255).trim().required(),
	description: Joi.string().max(1024).optional(),
	categoryId: Joi.number().integer().positive().required(),
	rentalPricePerDay: Joi.number().precision(2).positive().required(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.required(),
	quantityAvailable: Joi.number().integer().min(1).required(),
	address: Joi.string().max(512).trim().required(),
});

export class UpdateEquipmentRentalDto {
	@ApiProperty({
		example: "Camera",
		description: "Name of the equipment",
		required: false,
	})
	name?: string;

	@ApiProperty({
		example: "High-quality DSLR camera",
		description: "Description of the equipment",
		required: false,
	})
	description?: string;

	@ApiProperty({
		example: 1,
		description: "Category ID of the equipment",
		required: false,
	})
	categoryId?: number;

	@ApiProperty({
		example: 50.0,
		description: "Rental price per day",
		required: false,
	})
	rentalPricePerDay?: string;

	@ApiProperty({
		example: [
			{ url: "http://example.com/image1.jpg", path: "/image1.jpeg" },
			{ url: "http://example.com/image2.jpg", path: "/image2.jpeg" },
		],
		description: "List of image URLs for the equipment",
		required: false,
		type: [Images],
	})
	imageUrls?: Images[];

	@ApiProperty({
		example: 10,
		description: "Quantity of the equipment available",
		required: true,
	})
	quantityAvailable: number;

	@ApiProperty({
		example: "123 Main St, City, Country",
		description: "Address where the equipment can be picked up",
		required: false,
	})
	address?: string;
}

export const UpdateEquipmentRentalSchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	description: Joi.string().max(1024).optional(),
	categoryId: Joi.number().integer().positive().optional(),
	rentalPricePerDay: Joi.number().precision(2).positive().optional(),
	imageUrls: Joi.array()
		.items(
			Joi.object({
				url: Joi.string().uri().required(),
				path: Joi.string().required(),
			}),
		)
		.optional(),
	quantityAvailable: Joi.number().integer().min(1).required(),
	address: Joi.string().max(512).trim().optional(),
});

export class CreateCinemaDto {
	@ApiProperty({
		example: "Downtown Cinema",
		description: "The name of the cinema",
	})
	name: string;

	@ApiProperty({
		example: "123 Main St, Anytown, USA",
		description: "The address of the cinema",
	})
	address: string;

	@ApiProperty({
		example: "Anytown",
		description: "The city where the cinema is located",
	})
	city: string;

	@ApiProperty({
		example: "California",
		description: "The state where the cinema is located",
	})
	state: string;

	@ApiProperty({
		example: 1,
		description: "The ID of the country where the cinema is located",
	})
	countryId: number;
}

export const CreateCinemaSchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	address: Joi.string().trim().max(500).required(),
	city: Joi.string().trim().max(100).required(),
	state: Joi.string().trim().max(100).required(),
	countryId: Joi.number().integer().positive().required(),
});

export class UpdateCinemaDto {
	@ApiProperty({
		example: "Downtown Cinema",
		description: "The name of the cinema",
	})
	name?: string;

	@ApiProperty({
		example: "123 Main St, Anytown, USA",
		description: "The address of the cinema",
	})
	address?: string;

	@ApiProperty({
		example: "Anytown",
		description: "The city where the cinema is located",
	})
	city?: string;

	@ApiProperty({
		example: "California",
		description: "The state where the cinema is located",
	})
	state?: string;

	@ApiProperty({
		example: 1,
		description: "The ID of the country where the cinema is located",
	})
	countryId?: number;
}

export const UpdateCinemaSchema = Joi.object({
	name: Joi.string().trim().max(255).optional(),
	address: Joi.string().trim().max(500).optional(),
	city: Joi.string().trim().max(100).optional(),
	state: Joi.string().trim().max(100).optional(),
	countryId: Joi.number().integer().positive().optional(),
});

export class CreateCinemaHallDto {
	@ApiProperty({
		example: "Hall 1",
		description: "The name of the cinema hall",
	})
	name: string;

	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the cinema this hall belongs to",
	})
	cinemaId: string;
}

export const CreateCinemaHallSchema = Joi.object({
	name: Joi.string().trim().max(255).required(),
	cinemaId: Joi.string().required(),
});

export class UpdateCinemaHallDto {
	@ApiProperty({
		example: "Hall 1",
		description: "The name of the cinema hall",
	})
	name?: string;
}

export const UpdateCinemaHallSchema = Joi.object({
	name: Joi.string().trim().max(255).optional(),
});

export class CreateCinemaMovieDto {
	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the cinema this movie is being shown at",
	})
	cinemaId: string;

	@ApiProperty({
		example: "Inception",
		description: "The title of the movie",
	})
	title: string;

	@ApiProperty({
		example: "A mind-bending thriller by Christopher Nolan.",
		description: "The description of the movie",
	})
	description: string;

	@ApiProperty({
		example: "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
		description: "The main cast of the movie",
	})
	cast: string;

	@ApiProperty({
		example: 148,
		description: "The duration of the movie in minutes",
	})
	durationMinutes: number;

	@ApiProperty({
		example: 1,
		description: "The genre ID of the movie",
	})
	ageRating: number;

	@ApiProperty({
		example: "http://example.com/poster.jpg",
		description: "The URL of the movie poster",
	})
	posterUrl: string;

	@ApiProperty({
		example: "/images/poster.jpg",
		description: "The path of the movie poster on the server",
	})
	posterPath: string;

	@ApiProperty({
		example: "http://example.com/trailer.mp4",
		description: "The URL of the movie trailer",
	})
	trailerUrl: string;

	@ApiProperty({
		example: "/videos/trailer.mp4",
		description: "The path of the movie trailer on the server",
	})
	trailerPath: string;
}

export const CreateCinemaMovieSchema = Joi.object({
	cinemaId: Joi.string().required(),
	title: Joi.string().trim().max(255).required(),
	description: Joi.string().trim().max(2000).required(),
	cast: Joi.string().trim().max(1000).required(),
	durationMinutes: Joi.number().integer().positive().required(),
	ageRating: Joi.number().integer().min(0).max(100).required(),
	posterUrl: Joi.string().uri().required(),
	posterPath: Joi.string().trim().required(),
	trailerUrl: Joi.string().uri().required(),
	trailerPath: Joi.string().trim().required(),
});

export class UpdateCinemaMovieDto {
	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the cinema this movie is being shown at",
	})
	cinemaId?: string;

	@ApiProperty({
		example: "Inception",
		description: "The title of the movie",
	})
	title?: string;

	@ApiProperty({
		example: "A mind-bending thriller by Christopher Nolan.",
		description: "The description of the movie",
	})
	description?: string;

	@ApiProperty({
		example: "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
		description: "The main cast of the movie",
	})
	cast?: string;

	@ApiProperty({
		example: 148,
		description: "The duration of the movie in minutes",
	})
	durationMinutes?: number;

	@ApiProperty({
		example: 1,
		description: "The genre ID of the movie",
	})
	ageRating?: number;

	@ApiProperty({
		example: "http://example.com/poster.jpg",
		description: "The URL of the movie poster",
	})
	posterUrl?: string;

	@ApiProperty({
		example: "/images/poster.jpg",
		description: "The path of the movie poster on the server",
	})
	posterPath?: string;

	@ApiProperty({
		example: "http://example.com/trailer.mp4",
		description: "The URL of the movie trailer",
	})
	trailerUrl?: string;

	@ApiProperty({
		example: "/videos/trailer.mp4",
		description: "The path of the movie trailer on the server",
	})
	trailerPath?: string;
}

export const UpdateCinemaMovieSchema = Joi.object({
	cinemaId: Joi.string().optional(),
	title: Joi.string().trim().max(255).optional(),
	description: Joi.string().trim().max(2000).optional(),
	cast: Joi.string().trim().max(1000).optional(),
	durationMinutes: Joi.number().integer().positive().optional(),
	ageRating: Joi.number().integer().min(0).max(100).optional(),
	posterUrl: Joi.string().uri().optional(),
	posterPath: Joi.string().trim().optional(),
	trailerUrl: Joi.string().uri().optional(),
	trailerPath: Joi.string().trim().optional(),
});

export class AddMovieGenresToMovieDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: "List of genre IDs to be added to the movie",
	})
	genreIds: number[];
}

export const AddMovieGenresToMovieSchema = Joi.object({
	genreIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});

export class RemoveMovieGenresFromMovieDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: "List of genre IDs to be removed from the movie",
	})
	genreIds: number[];
}

export const RemoveMovieGenresFromMovieSchema = Joi.object({
	genreIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});

export class CreateSnacksDto {
	@ApiProperty({
		example: "Popcorn",
		description: "Name of the snack item",
	})
	name: string;

	@ApiProperty({
		example: 5.99,
		description: "Price of the snack item",
	})
	price: string;
}

export const CreateSnacksSchema = Joi.object({
	name: Joi.string().max(255).trim().required(),
	price: Joi.number().precision(2).positive().required(),
});

export class UpdateSnacksDto {
	@ApiProperty({
		example: "Popcorn",
		description: "Name of the snack item",
	})
	name?: string;

	@ApiProperty({
		example: 5.99,
		description: "Price of the snack item",
	})
	price?: string;
}

export const UpdateSnacksSchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	price: Joi.number().precision(2).positive().optional(),
});

export class MovieSnacksIdsDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: "List of snack IDs to be associated with the movie",
	})
	snackIds: number[];
}

export const MovieSnacksIdsSchema = Joi.object({
	snackIds: Joi.array()
		.items(Joi.number().integer().positive())
		.min(1)
		.required(),
});

export class CreateMovieShowtimeDto {
	@ApiProperty({
		example: "15.00",
		description: "Ticket price for the movie showtime",
	})
	ticketPrice: string;

	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the movie being shown",
	})
	movieId: string;

	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the cinema hall where the movie is shown",
	})
	cinemaHallId: string;

	@ApiProperty({
		example: "2023-10-15",
		description: "The date of the movie showtime",
	})
	showDate: string;

	@ApiProperty({
		example: "18:30",
		description: "The time of the movie showtime",
	})
	showtime: string;

	@ApiProperty({
		example: 100,
		description: "Total number of seats available for the showtime",
	})
	totalSeats?: number | undefined;
}

export const CreateMovieShowtimeSchema = Joi.object({
	ticketPrice: Joi.number().precision(2).positive().required(),
	movieId: Joi.string().required(),
	cinemaHallId: Joi.string().required(),
	showDate: Joi.date().required().greater("now"),
	showtime: Joi.string()
		.pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
		.required(),
	totalSeats: Joi.number().integer().min(1).optional(),
}).messages({
	"string.pattern.base": "showtime must be in HH:mm format",
	"date.base": "showDate must be a valid date",
	"date.greater": "showDate must be in the future",
});

export class UpdateMovieShowtimeDto {
	@ApiProperty({
		example: "15.00",
		description: "Ticket price for the movie showtime",
	})
	ticketPrice?: string;

	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the movie being shown",
	})
	movieId?: string;

	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the cinema hall where the movie is shown",
	})
	cinemaHallId?: string;

	@ApiProperty({
		example: "2023-10-15",
		description: "The date of the movie showtime",
	})
	showDate?: string;

	@ApiProperty({
		example: "18:30",
		description: "The time of the movie showtime",
	})
	showtime?: string;

	@ApiProperty({
		example: 100,
		description: "Total number of seats available for the showtime",
	})
	totalSeats?: number | undefined;
}

export const UpdateMovieShowtimeSchema = Joi.object({
	ticketPrice: Joi.number().precision(2).positive().optional(),
	movieId: Joi.string().optional(),
	cinemaHallId: Joi.string().optional(),
	showDate: Joi.date().optional().greater("now"),
	showtime: Joi.string()
		.pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
		.optional(),
	totalSeats: Joi.number().integer().min(1).optional(),
}).messages({
	"string.pattern.base": "showtime must be in HH:mm format",
	"date.greater": "showDate must be in the future",
});

export class CreateStudioDto {
	@ApiProperty({
		example: "Yoga Studio",
		description: "Name of the studio",
	})
	name: string;

	@ApiProperty({
		example: "200.00",
		description: "Hourly rate for renting the studio",
	})
	hourlyRate: string;

	@ApiProperty({
		example: "123 Main St, City, Country",
		description: "Physical location of the studio",
	})
	location: string;
}

export const CreateStudioSchema = Joi.object({
	name: Joi.string().max(255).trim().required(),
	hourlyRate: Joi.number().precision(2).positive().required(),
	location: Joi.string().max(512).trim().required(),
});

export class UpdateStudioDto {
	@ApiProperty({
		example: "Yoga Studio",
		description: "Name of the studio",
	})
	name?: string;

	@ApiProperty({
		example: "200.00",
		description: "Hourly rate for renting the studio",
	})
	hourlyRate?: string;

	@ApiProperty({
		example: "123 Main St, City, Country",
		description: "Physical location of the studio",
	})
	location?: string;
}

export const UpdateStudioSchema = Joi.object({
	name: Joi.string().max(255).trim().optional(),
	hourlyRate: Joi.number().precision(2).positive().optional(),
	location: Joi.string().max(512).trim().optional(),
});

export class CreateStudioAvailabilityDto {
	@ApiProperty({
		example: 1,
		description: "ID of the studio",
	})
	studioId: number;

	@ApiProperty({
		example: 1,
		description: "Day of the week (0=Sunday, 1=Monday, ..., 6=Saturday)",
	})
	dayOfWeek: number;

	@ApiProperty({
		example: "09:00",
		description: "Start time of availability (HH:mm format)",
	})
	startTime: string;

	@ApiProperty({
		example: "17:00",
		description: "End time of availability (HH:mm format)",
	})
	endTime: string;
}

export const CreateStudioAvailabilitySchema = Joi.object({
	studioId: Joi.number().integer().positive().required(),
	dayOfWeek: Joi.number().integer().min(0).max(6).required(),
	startTime: Joi.string().pattern(timePattern).required(),
	endTime: Joi.string().pattern(timePattern).required(),
}).custom((value, helpers) => {
	const { startTime, endTime } = value;

	if (startTime && endTime) {
		if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
			return helpers.error("time.endBeforeStart");
		}
	}

	return value;
});

export class RemoveStudioAvailabilityDto {
	@ApiProperty({
		example: ["iijjaljdfaijfd", "aidfaljfdlaj", "iosadjfjasldfj"],
		description: "IDs of the studio availability entry to be removed",
	})
	availabilityIds: string[];
}

export const RemoveStudioAvailabilitySchema = Joi.object({
	availabilityIds: Joi.array()
		.items(Joi.string().trim().required())
		.min(1)
		.required(),
});

export class BookStudioSessionDto {
	@ApiProperty({
		example: 1,
		description: "ID of the studio to be booked",
	})
	studioId: number;

	@ApiProperty({
		example: "2023-10-15",
		description: "Date of the booking (YYYY-MM-DD)",
	})
	bookingDate: string;

	@ApiProperty({
		example: "10:00",
		description: "Start time of the booking (HH:mm format)",
	})
	startTime: string;

	@ApiProperty({
		example: "12:00",
		description: "End time of the booking (HH:mm format)",
	})
	endTime: string;
}

export const BookStudioSessionSchema = Joi.object({
	studioId: Joi.number().integer().positive().required(),
	bookingDate: Joi.date()
		.required()
		.min(new Date().setHours(0, 0, 0, 0))
		.raw(),
	startTime: Joi.string().pattern(timePattern).required(),
	endTime: Joi.string().pattern(timePattern).required(),
})
	.custom((value, helpers) => {
		const { startTime, endTime } = value;

		if (startTime && endTime) {
			if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
				return helpers.error("time.endBeforeStart");
			}
		}

		return value;
	})
	.messages({
		"date.base": "bookingDate must be a valid date",
		"date.min": "bookingDate must be today or in the future",
		"time.endBeforeStart": "endTime must be after startTime",
	});

export class BookEquipmentRentalDto {
	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the equipment to be booked",
	})
	equipmentRentalId: string;

	@ApiProperty({
		example: "2023-10-15",
		description: "Start date of the booking (YYYY-MM-DD)",
	})
	rentalStartDate: string;

	@ApiProperty({
		example: "2023-10-20",
		description: "End date of the booking (YYYY-MM-DD)",
	})
	rentalEndDate: string;
}

export const BookEquipmentRentalSchema = Joi.object({
	equipmentRentalId: Joi.string().required(),
	rentalStartDate: Joi.date()
		.required()
		.min(new Date().setHours(0, 0, 0, 0))
		.raw(),
	rentalEndDate: Joi.date().required().min(Joi.ref("rentalStartDate")).raw(),
}).messages({
	"date.base": "{{#label}} must be a valid date",
	"date.min": "{{#label}} must be today or in the future",
	"date.greater": "endDate must be the same as or after startDate",
});

export class CreateVrGameTicketOrderDto {
	@ApiProperty({
		example: "iiujiodjk",
		description: "The ID of the VR game to book tickets for",
	})
	vrGameId: string;

	@ApiProperty({
		example: 2,
		description: "Number of tickets to book",
	})
	ticketQuantity: number;

	@ApiProperty({
		example: "2023-10-15",
		description: "Date of the booking (YYYY-MM-DD)",
	})
	scheduledDate: string;

	@ApiProperty({
		example: "14:00",
		description: "Scheduled start time for the VR game session (HH:mm format)",
	})
	scheduledTime: string;
}

export const CreateVrGameTicketOrderSchema = Joi.object({
	vrGameId: Joi.string().required(),
	ticketQuantity: Joi.number().integer().min(1).required(),
	scheduledDate: Joi.date()
		.required()
		.min(new Date().setHours(0, 0, 0, 0))
		.raw(),
	scheduledTime: Joi.string().pattern(timePattern).required(),
}).messages({
	"date.base": "scheduledDate must be a valid date",
	"date.min": "scheduledDate must be today or in the future",
});
