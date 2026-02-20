import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from '@studymate/cache';
import { createLogger } from '@studymate/logger';
import { Server } from 'http';
import { socketAuth } from '../middleware/socket.auth.middleware';
import { Conversation, Message, MessageStatus, Room } from '@studymate/database';
import { Types } from 'mongoose';

const logger = createLogger('socket-service');

export class SocketService {
    private static _io: SocketIOServer;

    public static init(httpServer: Server) {
        if (this._io) {
            return this._io;
        }

        this._io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || '*',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        // Setup Redis Adapter for scaling
        const pubClient = getRedisClient().duplicate();
        const subClient = getRedisClient().duplicate();

        Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
            this._io.adapter(createAdapter(pubClient, subClient) as any);
            logger.info('Socket.io Redis adapter initialized');
        }).catch((err) => {
            logger.error('Failed to initialize Socket.io Redis adapter:', err);
        });

        // 1. Socket Authentication
        this._io.use(socketAuth);

        const redis = getRedisClient();

        this._io.on('connection', async (socket) => {
            const userId = socket.user?.userId;
            const socketId = socket.id;

            if (!userId) {
                socket.disconnect(true);
                return;
            }

            logger.info(`User connected: ${userId} (Socket: ${socketId})`);

            // 1. Automatic User Room Join & 2. Presence System
            try {
                // Join user's private room automatically
                await socket.join(`user:${userId}`);

                // Update Redis Presence
                const multi = redis.multi();
                multi.sAdd('online_users', userId);
                multi.sAdd(`user:${userId}:sockets`, socketId);
                multi.set(`socket:${socketId}:user`, userId);
                await multi.exec();

                // Broadcast online status to all connected clients
                this._io.emit('user_online', { userId });
                logger.debug(`Broadcasted user_online for ${userId}`);
            } catch (err) {
                logger.error(`Error entering presence for ${userId}:`, err);
            }

            // Allow clients to request the current online users list
            socket.on('get_online_users', async () => {
                try {
                    const onlineUserIds = await redis.sMembers('online_users');
                    socket.emit('online_users_list', onlineUserIds);
                } catch (err) {
                    logger.error('Error fetching online users:', err);
                }
            });

            // 3. Message Delivery and Read Receipts (with DB Status Updates)
            socket.on('mark_read', async (data: { conversationId: string, messageIds: string[] }) => {
                const { conversationId, messageIds } = data;

                try {
                    // Update DB status to READ
                    await Message.updateMany(
                        { _id: { $in: messageIds }, conversationId },
                        { $set: { status: MessageStatus.READ } }
                    );

                    // Emit to conversation so sender(s) see the update
                    socket.to(`conversation:${conversationId}`).emit('message_read', {
                        conversationId,
                        messageIds,
                        readBy: userId,
                        at: new Date()
                    });
                } catch (error) {
                    logger.error(`Error marking messages as read:`, error);
                }
            });

            socket.on('mark_delivered', async (data: { conversationId: string, messageIds: string[] }) => {
                const { conversationId, messageIds } = data;

                try {
                    // Update DB status to DELIVERED (only if not already read)
                    await Message.updateMany(
                        {
                            _id: { $in: messageIds },
                            conversationId,
                            status: MessageStatus.SENT
                        },
                        { $set: { status: MessageStatus.DELIVERED } }
                    );

                    socket.to(`conversation:${conversationId}`).emit('message_delivered', {
                        conversationId,
                        messageIds,
                        deliveredTo: userId,
                        at: new Date()
                    });
                } catch (error) {
                    logger.error(`Error marking messages as delivered:`, error);
                }
            });

            // 4. Access Validation & 5. Multi-device Handling

            // Removed 'join_user_room' listener as it's now automatic on connection

            // 7. Typing Indicator Improvements
            socket.on('typing', (data: { conversationId?: string, roomId?: string }) => {
                const payload = { ...data, userId };
                if (data.conversationId) {
                    // We can verify conversation participation here too if strictness is required,
                    // but usually room join validation is sufficient.
                    socket.to(`conversation:${data.conversationId}`).emit('typing', payload);
                } else if (data.roomId) {
                    socket.to(`room:${data.roomId}`).emit('typing', payload);
                }
            });

            socket.on('join_conversation', async (conversationId: string) => {
                try {
                    // Strict Access Validation
                    const conversation = await Conversation.findOne({
                        _id: conversationId,
                        participants: userId
                    });

                    if (!conversation) {
                        logger.warn(`User ${userId} attempted unauthorized join to conversation ${conversationId}`);
                        socket.emit('error', { message: 'Unauthorized access or conversation not found' });
                        return;
                    }

                    await socket.join(`conversation:${conversationId}`);
                    logger.debug(`Socket ${socketId} joined conversation: ${conversationId}`);
                } catch (error) {
                    logger.error(`Error joining conversation:`, error);
                }
            });

            socket.on('join_room', async (roomId: string) => {
                try {
                    // Strict Room Validation
                    // Check if room exists and is active
                    const room = await Room.findOne({ _id: roomId, isActive: true });

                    if (!room) {
                        logger.warn(`User ${userId} attempted to join invalid/inactive room ${roomId}`);
                        socket.emit('error', { message: 'Room not found or inactive' });
                        return;
                    }

                    // In the future, check specific room membership lists here if added to schema

                    await socket.join(`room:${roomId}`);
                    logger.debug(`Socket ${socketId} joined room: ${roomId}`);
                } catch (error) {
                    logger.error(`Error joining room:`, error);
                }
            });

            socket.on('disconnect', async () => {
                logger.info(`User disconnected: ${userId} (Socket: ${socketId})`);

                try {
                    // Proper Redis Presence Cleanup
                    const multi = redis.multi();
                    multi.sRem(`user:${userId}:sockets`, socketId);
                    multi.del(`socket:${socketId}:user`);
                    await multi.exec();

                    const remainingSockets = await redis.sCard(`user:${userId}:sockets`);
                    if (remainingSockets === 0) {
                        await redis.sRem('online_users', userId);
                        // Broadcast offline status only when ALL sockets are gone
                        this._io.emit('user_offline', { userId });
                        logger.debug(`Broadcasted user_offline for ${userId}`);
                    }
                } catch (err) {
                    logger.error(`Error clearing presence for ${userId}:`, err);
                }
            });
        });

        return this._io;
    }

    public static get io() {
        if (!this._io) {
            throw new Error('Socket.io not initialized!');
        }
        return this._io;
    }
}
