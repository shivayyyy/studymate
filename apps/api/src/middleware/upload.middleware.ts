import multer from 'multer';
import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES } from '@studymate/config';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
    fileFilter,
});
