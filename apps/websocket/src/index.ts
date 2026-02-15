import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { createLogger } from '@studymate/logger';
import { authMiddleware } from './middleware/auth.middleware';
import { registerRoomHandlers } from './handlers/room.handler';
import { registerTimerHandlers } from './handlers/timer.handler';
import { registerPresenceHandlers } from './handlers/presence.handler';
import { registerChatHandlers } from './handlers/chat.handler';

const logger = createLogger('websocket');
const PORT = parseInt(process.env.PORT || '3002');

const io = new Server(PORT, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
});

// ==================== Redis Adapter ====================

const setupRedisAdapter = async () => {
    try {
        const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        logger.info('Redis adapter connected for Socket.io');
    } catch (error) {
        logger.warn('Redis adapter not available, running without horizontal scaling:', error);
    }
};

// ==================== Middleware ====================

io.use(authMiddleware);

// ==================== Connection ====================

io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.data.userId} (socket: ${socket.id})`);

    registerRoomHandlers(io, socket);
    registerTimerHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on('disconnect', (reason) => {
        logger.info(`User disconnected: ${socket.data.userId} (reason: ${reason})`);
    });
});

// ==================== Startup ====================

const start = async () => {
    await setupRedisAdapter();
    logger.info(`WebSocket server running on port ${PORT}`);
};

start().catch((err) => {
    logger.error('Failed to start WebSocket server:', err);
    process.exit(1);
});

export { io };
