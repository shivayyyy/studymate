import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

export const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.post('/conversations', ChatController.startConversation);
chatRouter.get('/conversations', ChatController.getConversations);
chatRouter.get('/conversations/:conversationId/messages', ChatController.getMessages);
chatRouter.post('/conversations/:conversationId/messages', ChatController.sendMessage);

chatRouter.get('/rooms/:roomId/messages', ChatController.getMessages);
chatRouter.post('/rooms/:roomId/messages', ChatController.sendMessage);
