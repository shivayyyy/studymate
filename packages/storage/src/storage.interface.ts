export interface UploadResult {
    url: string;
    publicId: string;
    originalName: string;
    mimeType: string;
    size: number;
}

export interface IStorageProvider {
    upload(file: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    delete(publicId: string): Promise<void>;
    getUrl(publicId: string): string;
}
