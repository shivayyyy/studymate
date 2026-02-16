import type { Request, Response } from 'express';
import { getStorageProvider } from '@studymate/storage';
import { asyncHandler, success } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class UploadController {
    static uploadFile = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError('No file provided', 400);
        }

        const storage = getStorageProvider();
        const result = await storage.upload(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
        );

        res.status(201).json(success(result, 'File uploaded successfully'));
    });

    static deleteFile = asyncHandler(async (req: Request, res: Response) => {
        const { publicId } = req.params;
        if (!publicId || typeof publicId !== 'string') throw new AppError('Public ID is required', 400);

        const storage = getStorageProvider();
        await storage.delete(publicId);

        res.json(success(null, 'File deleted successfully'));
    });
}
