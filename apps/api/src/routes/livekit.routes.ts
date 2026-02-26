import { Router } from 'express';
import { LiveKitController } from '../controllers/livekit.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/rooms/:roomId/audio-token', LiveKitController.getToken);

export { router as livekitRoutes };
