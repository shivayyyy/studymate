import { Socket } from 'socket.io';
import { verifyAccessToken, TokenPayload } from '@studymate/auth';
import { createLogger } from '@studymate/logger';


const logger = createLogger('socket-auth');

// Extend Socket type to include user
declare module 'socket.io' {
    interface Socket {
        user?: TokenPayload;
    }
}

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
        logger.warn(`Socket connection denied: No token provided (Socket ID: ${socket.id})`);
        return next(new Error('Authentication error: Token required'));
    }

    try {
        const decoded = verifyAccessToken(token);
        socket.user = decoded;
        next();
    } catch (error) {
        logger.warn(`Socket connection denied: Invalid token (Socket ID: ${socket.id})`);
        return next(new Error('Authentication error: Invalid token'));
    }
};
