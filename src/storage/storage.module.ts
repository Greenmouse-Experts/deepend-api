import { Module } from "@nestjs/common";
import { CloudinaryProvider } from "./cloudinary/cloudinary.provider";
import { CloudinaryService } from "./cloudinary/cloudinary.service";
import { StorageService } from "./storage.service";

@Module({
	providers: [
		CloudinaryProvider,
		CloudinaryService,
		{
			provide: StorageService,
			useClass: CloudinaryService,
		},
	],
	exports: [StorageService],
})
export class StorageModule {}
