import type { Server, Socket } from 'socket.io';
import { createLogger } from '@studymate/logger';
import { randomUUID } from 'crypto';

const logger = createLogger('chat-handler');

export const registerChatHandlers = (io: Server, socket: Socket) => {
    const sendMessage = (data: { roomId: string; content: string }) => {
        const { roomId, content } = data;

        if (!content || content.trim().length === 0) return;
        if (content.length > 500) return;

        const message = {
            id: randomUUID(),
            roomId,
            userId: socket.data.userId,
            username: socket.data.username,
            content: content.trim(),
            timestamp: Date.now(),
        };

        io.to(roomId).emit('chat:message', message);
        logger.debug(`Message in ${roomId} from ${socket.data.username}: ${content.substring(0, 50)}`);
    };

    const typing = (data: { roomId: string }) => {
        const { roomId } = data;
        socket.to(roomId).emit('chat:typing', {
            userId: socket.data.userId,
            username: socket.data.username,
            isTyping: true,
        });
    };

    const stopTyping = (data: { roomId: string }) => {
        const { roomId } = data;
        socket.to(roomId).emit('chat:typing', {
            userId: socket.data.userId,
            username: socket.data.username,
            isTyping: false,
        });
    };

    socket.on('chat:send', sendMessage);
    socket.on('chat:typing', typing);
    socket.on('chat:stop-typing', stopTyping);
};
