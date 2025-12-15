//@ts-nocheck
export abstract class StorageService {
	abstract generateUploadPresignedUrl(folder: string);

	abstract getFileUrl(fileName: string): Promise<string>;

	abstract getPresignedFileUrl(objectKey: string): Promise<string>;

	abstract deleteFileFromStorage(fileName: string);

	abstract deleteFileFromPrivateStorage(objectKey: string);

	abstract deleteFilesFromStorage(public_ids: string[]);

	abstract deleteFilesFromPrivateStorage(objectKeys: string[]);
}
