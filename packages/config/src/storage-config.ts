export const STORAGE_CONFIG = {
    maxFileSizeMB: 10,
    maxFileSizeBytes: 10 * 1024 * 1024,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocTypes: ['application/pdf'],
    thumbnailWidth: 300,
    thumbnailHeight: 300,
    thumbnailQuality: 80,
    uploadDir: 'uploads',
    cdnBaseUrl: process.env.CDN_BASE_URL || '',
} as const;
