import type { Socket } from 'socket.io';
import { verifyAccessToken } from '@studymate/auth';

export const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
        return next(new Error('Authentication token required'));
    }

    try {
        const payload = verifyAccessToken(token);
        socket.data.userId = payload.userId;
        socket.data.username = payload.username;
        socket.data.email = payload.email;
        next();
    } catch (error) {
        next(new Error('Invalid or expired token'));
    }
};
