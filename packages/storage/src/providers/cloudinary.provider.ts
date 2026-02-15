import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import type { IStorageProvider, UploadResult } from '../storage.interface';

export class CloudinaryProvider implements IStorageProvider {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async upload(file: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'studymate',
                    resource_type: resourceType,
                    public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`,
                },
                (error, result) => {
                    if (error || !result) {
                        reject(error || new Error('Upload failed'));
                        return;
                    }

                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        originalName: fileName,
                        mimeType,
                        size: result.bytes,
                    });
                },
            );

            uploadStream.end(file);
        });
    }

    async delete(publicId: string): Promise<void> {
        await cloudinary.uploader.destroy(publicId);
    }

    getUrl(publicId: string): string {
        return cloudinary.url(publicId, { secure: true });
    }
}
