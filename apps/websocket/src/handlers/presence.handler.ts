import type { Server, Socket } from 'socket.io';
import { UserCache } from '@studymate/cache';
import { createLogger } from '@studymate/logger';
import type { PresenceStatus } from '@studymate/types';

const logger = createLogger('presence-handler');

export const registerPresenceHandlers = (io: Server, socket: Socket) => {
    const updatePresence = async (data: { roomId: string; status: PresenceStatus }) => {
        const { roomId, status } = data;
        const userId = socket.data.userId;

        await UserCache.setPresence(userId, status);

        socket.to(roomId).emit('presence:update', {
            userId,
            status,
            lastSeenAt: Date.now(),
        });
    };

    socket.on('presence:update', updatePresence);

    // Auto-set online on connection
    UserCache.setPresence(socket.data.userId, 'ONLINE').catch(() => { });

    // Auto-set offline on disconnect
    socket.on('disconnect', () => {
        UserCache.setPresence(socket.data.userId, 'OFFLINE').catch(() => { });
    });
};
