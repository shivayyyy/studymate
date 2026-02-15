import type { IStorageProvider } from './storage.interface';
import { S3Provider } from './providers/s3.provider';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { LocalProvider } from './providers/local.provider';

export type StorageProviderType = 's3' | 'cloudinary' | 'local';

let storageInstance: IStorageProvider | null = null;

export const createStorageProvider = (provider?: StorageProviderType): IStorageProvider => {
    if (storageInstance) return storageInstance;

    const type = provider || (process.env.STORAGE_PROVIDER as StorageProviderType) || 'local';

    switch (type) {
        case 's3':
            storageInstance = new S3Provider();
            break;
        case 'cloudinary':
            storageInstance = new CloudinaryProvider();
            break;
        case 'local':
        default:
            storageInstance = new LocalProvider();
            break;
    }

    console.log(`Storage provider initialized: ${type}`);
    return storageInstance;
};

export const getStorageProvider = (): IStorageProvider => {
    if (!storageInstance) {
        return createStorageProvider();
    }
    return storageInstance;
};
