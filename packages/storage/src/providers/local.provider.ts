import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type { IStorageProvider, UploadResult } from '../storage.interface';

export class LocalProvider implements IStorageProvider {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.resolve(process.cwd(), 'uploads');
        this.ensureDir();
    }

    private async ensureDir() {
        await fs.mkdir(this.uploadDir, { recursive: true });
    }

    async upload(file: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
        const publicId = `${Date.now()}-${randomUUID()}-${fileName}`;
        const filePath = path.join(this.uploadDir, publicId);

        await fs.writeFile(filePath, file);

        return {
            url: `/uploads/${publicId}`,
            publicId,
            originalName: fileName,
            mimeType,
            size: file.length,
        };
    }

    async delete(publicId: string): Promise<void> {
        const filePath = path.join(this.uploadDir, publicId);
        await fs.unlink(filePath).catch(() => { });
    }

    getUrl(publicId: string): string {
        return `/uploads/${publicId}`;
    }
}
