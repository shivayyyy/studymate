import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createRoomSchema } from '@studymate/validation';
import { RoomController } from '../controllers/room.controller';

const router = Router();

router.get('/', RoomController.getAll);
router.get('/:id', RoomController.getById);
router.post('/', authenticate, validate(createRoomSchema), RoomController.create);
router.put('/:id', authenticate, RoomController.update);
router.delete('/:id', authenticate, RoomController.remove);

export { router as roomRouter };
