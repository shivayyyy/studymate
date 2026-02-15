import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { SessionController } from '../controllers/session.controller';

const router = Router();

router.post('/start', authenticate, SessionController.startSession);
router.post('/end', authenticate, SessionController.endSession);
router.get('/active', authenticate, SessionController.getActiveSession);
router.get('/history', authenticate, SessionController.getSessionHistory);

export { router as sessionRouter };
