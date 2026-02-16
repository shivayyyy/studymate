import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from '@studymate/validation';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, UserController.getMe);
router.put('/me', authenticate, validate(updateUserSchema), UserController.updateMe);
router.get('/search', authenticate, UserController.search);
router.get('/:id', UserController.getById);
router.post('/:id/follow', authenticate, UserController.follow);
router.delete('/:id/follow', authenticate, UserController.unfollow);
router.get('/:id/followers', UserController.getFollowers);
router.get('/:id/following', UserController.getFollowing);

export { router as userRouter };
