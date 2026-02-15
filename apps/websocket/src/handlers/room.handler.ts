import type { Server, Socket } from 'socket.io';
import { RoomCache } from '@studymate/cache';
import { createLogger } from '@studymate/logger';

const logger = createLogger('room-handler');

export const registerRoomHandlers = (io: Server, socket: Socket) => {
    const joinRoom = async (data: { roomId: string }) => {
        const { roomId } = data;
        const userId = socket.data.userId;
        const username = socket.data.username;

        socket.join(roomId);
        await RoomCache.addUserToRoom(roomId, userId);
        await RoomCache.incrementOccupancy(roomId);

        const users = await RoomCache.getRoomUsers(roomId);

        socket.to(roomId).emit('room:user-joined', {
            userId,
            username,
            occupancy: users.length,
        });

        socket.emit('room:joined', {
            roomId,
            users,
            occupancy: users.length,
        });

        logger.info(`User ${username} joined room ${roomId}`);
    };

    const leaveRoom = async (data: { roomId: string }) => {
        const { roomId } = data;
        const userId = socket.data.userId;

        socket.leave(roomId);
        await RoomCache.removeUserFromRoom(roomId, userId);
        await RoomCache.decrementOccupancy(roomId);

        const users = await RoomCache.getRoomUsers(roomId);

        socket.to(roomId).emit('room:user-left', {
            userId,
            occupancy: users.length,
        });

        logger.info(`User ${socket.data.username} left room ${roomId}`);
    };

    socket.on('room:join', joinRoom);
    socket.on('room:leave', leaveRoom);

    // Handle disconnection — leave all rooms
    socket.on('disconnecting', async () => {
        for (const roomId of socket.rooms) {
            if (roomId !== socket.id) {
                await leaveRoom({ roomId });
            }
        }
    });
};
