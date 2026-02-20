import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPostSchema, updatePostSchema, createCommentSchema } from '@studymate/validation';
import { PostController } from '../controllers/post.controller';

const router = Router();

router.get('/', optionalAuthenticate, PostController.getAll);
router.get('/:id', PostController.getById);
router.post('/', authenticate, validate(createPostSchema), PostController.create);
router.put('/:id', authenticate, validate(updatePostSchema), PostController.update);
router.delete('/:id', authenticate, PostController.delete);

// Likes
router.post('/:id/like', authenticate, PostController.like);
router.delete('/:id/like', authenticate, PostController.unlike);

// Comments
router.get('/:id/comments', PostController.getComments);
router.post('/:id/comments', authenticate, validate(createCommentSchema), PostController.addComment);
router.delete('/:id/comments/:commentId', authenticate, PostController.deleteComment);

// Save
router.post('/:id/save', authenticate, PostController.save);
router.delete('/:id/save', authenticate, PostController.unsave);

export { router as postRouter };
