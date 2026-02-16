import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { startSessionSchema } from '@studymate/validation';
import { SessionController } from '../controllers/session.controller';

const router = Router();

router.post('/start', authenticate, validate(startSessionSchema), SessionController.startSession);
router.post('/end', authenticate, SessionController.endSession);
router.get('/active', authenticate, SessionController.getActiveSession);
router.get('/history', authenticate, SessionController.getSessionHistory);

export { router as sessionRouter };
