import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { IStorageProvider, UploadResult } from '../storage.interface';
import { randomUUID } from 'crypto';

export class S3Provider implements IStorageProvider {
    private client: S3Client;
    private bucket: string;
    private region: string;

    constructor() {
        this.region = process.env.AWS_REGION || 'us-east-1';
        this.bucket = process.env.S3_BUCKET_NAME || 'studymate-uploads';

        this.client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    async upload(file: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
        const publicId = `${Date.now()}-${randomUUID()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: publicId,
            Body: file,
            ContentType: mimeType,
        });

        await this.client.send(command);

        return {
            url: this.getUrl(publicId),
            publicId,
            originalName: fileName,
            mimeType,
            size: file.length,
        };
    }

    async delete(publicId: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: publicId,
        });
        await this.client.send(command);
    }

    getUrl(publicId: string): string {
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${publicId}`;
    }
}
