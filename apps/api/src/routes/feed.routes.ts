import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { FeedController } from '../controllers/feed.controller';

const router = Router();

router.get('/trending', FeedController.getTrending);
router.get('/following', authenticate, FeedController.getFollowing);
router.get('/saved', authenticate, FeedController.getSaved);

export { router as feedRouter };
