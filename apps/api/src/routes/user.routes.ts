import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from '@studymate/validation';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, UserController.getMe);
router.put('/me', authenticate, validate(updateUserSchema), UserController.updateMe);
router.get('/search', authenticate, UserController.search);
router.get('/check-availability', UserController.checkUsernameAvailability); // Public endpoint
router.get('/:id', UserController.getById);
router.post('/:id/follow', authenticate, UserController.follow);
router.delete('/:id/follow', authenticate, UserController.unfollow);
router.get('/:id/followers', UserController.getFollowers);
router.get('/:id/following', UserController.getFollowing);
router.get('/:id/posts', UserController.getUserPosts);
router.get('/:id/saved', authenticate, UserController.getUserSaved); // Only authenticated user can see their saved? Or public? Usually private or user specific. Assuming public for now but let's keep it safe or maybe check if req.user.userId === params.id if strict privacy needed. For now, just authenticate to ensure valid user requesting.

export { router as userRouter };
