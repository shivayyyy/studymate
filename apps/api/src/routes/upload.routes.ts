import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/', authenticate, upload.single('file'), UploadController.uploadFile);
router.delete('/:publicId', authenticate, UploadController.deleteFile);

export default router;
