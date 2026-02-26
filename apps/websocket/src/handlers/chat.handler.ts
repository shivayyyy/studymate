import type { Server, Socket } from 'socket.io';
import { createLogger } from '@studymate/logger';
import { randomUUID } from 'crypto';

const logger = createLogger('chat-handler');
import { RoomMessage } from '@studymate/database';

export const registerChatHandlers = (io: Server, socket: Socket) => {
    const sendMessage = async (data: { roomId: string; content: string }) => {
        const { roomId, content } = data;

        if (!content || content.trim().length === 0) return;
        if (content.length > 500) return;

        try {
            const roomMessage = await RoomMessage.create({
                roomId,
                userId: socket.data.userId,
                username: socket.data.username,
                content: content.trim(),
            });

            const message = {
                id: roomMessage._id.toString(),
                roomId,
                userId: socket.data.userId,
                username: socket.data.username,
                content: content.trim(),
                timestamp: roomMessage.timestamp.getTime(),
            };

            io.to(roomId).emit('chat:message', message);
            logger.debug(`Message in ${roomId} from ${socket.data.username}: ${content.substring(0, 50)}`);
        } catch (err) {
            logger.error(`Failed to save message: ${err}`);
        }
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
