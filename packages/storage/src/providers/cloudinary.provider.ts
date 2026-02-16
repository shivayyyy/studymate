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
            const resourceType = this.getResourceType(mimeType);

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'studymate',
                    resource_type: resourceType,
                    public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`,
                    overwrite: false,
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
        // Try image first, then raw (Cloudinary requires correct resource_type)
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        if (result.result !== 'ok') {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }
    }

    getUrl(publicId: string): string {
        return cloudinary.url(publicId, {
            secure: true,
            fetch_format: 'auto',
            quality: 'auto',
        });
    }

    private getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        return 'raw';
    }
}

