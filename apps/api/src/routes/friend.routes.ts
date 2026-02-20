
import { Router } from 'express';
import { FriendController } from '../controllers/friend.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

// Friend Request Actions
router.post('/request/:userId', FriendController.sendRequest);
router.post('/accept/:requestId', FriendController.acceptRequest);
router.post('/decline/:requestId', FriendController.declineRequest);
router.delete('/cancel/:requestId', FriendController.cancelRequest);

// Lists
router.get('/requests/incoming', FriendController.getIncoming);
router.get('/requests/outgoing', FriendController.getOutgoing);
router.get('/', FriendController.getFriends);
router.get('/status/:userId', FriendController.getStatus);

// Unfriend
router.delete('/:userId', FriendController.unfriend);

export { router as friendRouter };
