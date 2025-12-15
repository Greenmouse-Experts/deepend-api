import { Injectable } from "@nestjs/common";
import { v2 } from "cloudinary";
import { StorageService } from "../storage.service";

@Injectable()
export class CloudinaryService implements StorageService {
	async generateUploadPresignedUrl(folder: string) {
		const paramsToSign = {
			timestamp: Math.floor(new Date().getTime() / 1000) + 60 * 10, // Expires in 10 minutes
			folder: `deepend/${folder}`,
		};

		const signature = v2.utils.api_sign_request(
			paramsToSign,
			process.env.CLOUDINARY_SECRET as string,
		);

		return {
			uploadUrl:
				"https://api.cloudinary.com/v1_1/" +
				process.env.CLOUDINARY_CLOUD_NAME +
				"/auto/upload",
			signature,
			apiKey: process.env.CLOUDINARY_API_KEY,
			cloudName: process.env.CLOUDINARY_CLOUD_NAME,
			timestamp: paramsToSign.timestamp,
			folder: paramsToSign.folder,
		};
	}

	async getFileUrl(objectKey: string): Promise<string> {
		//Generate a URL for the file
		return v2.url(objectKey);
	}

	async getPresignedFileUrl(objectKey: string): Promise<string> {
		//Generate a URL for the private file with a short-lived signed URL
		return v2.url(objectKey, {
			sign_url: true,
			expires_at: Math.floor(Date.now() / 1000) + 60 * 10,
		}); // URL valid for 10 minutes
	}

	//Delete a file from the user folder
	async deleteFileFromStorage(fileName: string) {
		return new Promise((resolve, reject) => {
			v2.uploader.destroy(fileName, (error, result) => {
				if (error) {
					console.log(error);
					reject(error);
				}

				resolve(result);
			});
		});
	}

	//Delete multiple files from the user folder
	async deleteFilesFromStorage(public_ids: string[]) {
		return new Promise((resolve, reject) => {
			v2.api.delete_resources(public_ids, (error, result) => {
				if (error) {
					console.log(error);
					reject(error);
				}

				resolve(result);
			});
		});
	}

	deleteFileFromPrivateStorage(objectKey: string) {}

	deleteFilesFromPrivateStorage(objectKeys: string[]) {}
}
