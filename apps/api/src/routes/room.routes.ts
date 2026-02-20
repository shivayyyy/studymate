import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (if any? listing might be public? usually better protected)
// Let's protect all for now as user needs to be logged in to be in the app

router.use(authenticate);

router.post('/', RoomController.createRoom);
router.get('/', RoomController.getRooms);
router.get('/:id', RoomController.getRoomById);
router.post('/:id/join', RoomController.joinRoom);

export const roomRouter = router;
