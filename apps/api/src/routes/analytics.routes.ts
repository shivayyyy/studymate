import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/stats', authenticate, AnalyticsController.getUserStats);
router.get('/leaderboard', AnalyticsController.getLeaderboard);
router.get('/rank', authenticate, AnalyticsController.getUserRank);

export { router as analyticsRouter };
