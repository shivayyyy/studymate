import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from '@studymate/cache';
import { createLogger } from '@studymate/logger';
import { Server } from 'http';
import { socketAuth } from '../middleware/socket.auth.middleware';
import { Conversation, Message, MessageStatus, Room } from '@studymate/database';
import { RoomCache } from '@studymate/cache';
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
                    const room = await Room.findOne({ _id: roomId, isActive: true });
                    if (!room) {
                        socket.emit('error', { message: 'Room not found or inactive' });
                        return;
                    }
                    await socket.join(`room:${roomId}`);
                    logger.debug(`Socket ${socketId} joined room: ${roomId}`);
                } catch (error) {
                    logger.error(`Error joining room:`, error);
                }
            });

            // ==================== Room System Handlers ====================

            socket.on('room:join', async (data: { roomId: string }) => {
                const { roomId } = data;
                try {
                    socket.join(roomId);
                    await RoomCache.addUserToRoom(roomId, userId);
                    await RoomCache.incrementOccupancy(roomId);

                    const users = await RoomCache.getRoomUsers(roomId);

                    socket.to(roomId).emit('room:user-joined', {
                        userId,
                        username: socket.user?.username || 'Unknown',
                        occupancy: users.length,
                    });

                    socket.emit('room:joined', {
                        roomId,
                        users,
                        occupancy: users.length,
                    });

                    logger.info(`User ${userId} joined room ${roomId}`);
                } catch (error) {
                    logger.error(`Error in room:join for room ${roomId}:`, error);
                    socket.emit('room:error', { message: 'Failed to join room' });
                }
            });

            socket.on('room:leave', async (data: { roomId: string }) => {
                const { roomId } = data;
                try {
                    socket.leave(roomId);
                    await RoomCache.removeUserFromRoom(roomId, userId);
                    await RoomCache.decrementOccupancy(roomId);

                    const users = await RoomCache.getRoomUsers(roomId);

                    socket.to(roomId).emit('room:user-left', {
                        userId,
                        occupancy: users.length,
                    });

                    logger.info(`User ${userId} left room ${roomId}`);

                    // Check if leaving user is the owner
                    const room = await Room.findById(roomId);
                    if (room && (room as any).ownerId?.toString() === userId) {
                        const remainingUsers = await RoomCache.getRoomUsers(roomId);
                        if (remainingUsers.length > 0) {
                            const newOwnerId = remainingUsers[0];
                            (room as any).ownerId = newOwnerId;
                            (room as any).isOwnerless = false;
                            await room.save();
                            this._io.to(roomId).emit('room:owner-changed', {
                                previousOwnerId: userId,
                                newOwnerId,
                            });
                        } else {
                            (room as any).isOwnerless = true;
                            room.isActive = false;
                            await room.save();
                        }
                    }
                } catch (error) {
                    logger.error(`Error in room:leave for room ${roomId}:`, error);
                }
            });

            socket.on('room:focus-mode', async (data: { roomId: string; enabled: boolean }) => {
                const { roomId, enabled } = data;
                try {
                    const room = await Room.findById(roomId);
                    if (!room || (room as any).ownerId?.toString() !== userId) {
                        socket.emit('room:error', { message: 'Only the room owner can toggle focus mode' });
                        return;
                    }
                    (room as any).settings.focusModeEnabled = enabled;
                    await room.save();
                    this._io.to(roomId).emit('room:focus-mode-changed', { roomId, enabled });
                    logger.info(`Focus mode ${enabled ? 'enabled' : 'disabled'} in room ${roomId}`);
                } catch (error) {
                    logger.error(`Error toggling focus mode:`, error);
                }
            });

            socket.on('room:transfer-ownership', async (data: { roomId: string; newOwnerId: string }) => {
                const { roomId, newOwnerId } = data;
                try {
                    const room = await Room.findById(roomId);
                    if (!room || (room as any).ownerId?.toString() !== userId) {
                        socket.emit('room:error', { message: 'Only the room owner can transfer ownership' });
                        return;
                    }
                    (room as any).ownerId = newOwnerId;
                    await room.save();
                    this._io.to(roomId).emit('room:owner-changed', { previousOwnerId: userId, newOwnerId });
                } catch (error) {
                    logger.error(`Error transferring ownership:`, error);
                }
            });

            socket.on('room:kick-user', async (data: { roomId: string; targetUserId: string }) => {
                const { roomId, targetUserId } = data;
                try {
                    const room = await Room.findById(roomId);
                    if (!room || (room as any).ownerId?.toString() !== userId) {
                        socket.emit('room:error', { message: 'Only the room owner can kick users' });
                        return;
                    }
                    this._io.to(roomId).emit('room:user-kicked', { userId: targetUserId, reason: 'Kicked by owner' });
                } catch (error) {
                    logger.error(`Error kicking user:`, error);
                }
            });

            socket.on('audio:mute-toggle', (data: { roomId: string; isMuted: boolean }) => {
                const { roomId, isMuted } = data;
                socket.to(roomId).emit('audio:user-muted', { userId, isMuted });
            });

            // Chat send handler for room chat
            socket.on('chat:send', async (data: { roomId: string; content: string }) => {
                const { roomId, content } = data;
                const message = {
                    id: new Types.ObjectId().toString(),
                    userId,
                    username: socket.user?.username || 'Unknown',
                    content,
                    timestamp: Date.now(),
                };
                this._io.to(roomId).emit('chat:message', message);
            });

            // ==================== Timer Handlers ====================

            const timerIntervals = new Map<string, NodeJS.Timer>();

            socket.on('timer:start', async (data: { roomId: string; durationSeconds: number; mode: string }) => {
                const { roomId, durationSeconds, mode } = data;
                try {
                    const room = await Room.findById(roomId);
                    if (!room || (room as any).ownerId?.toString() !== userId) {
                        socket.emit('room:error', { message: 'Only the room owner can control the timer' });
                        return;
                    }

                    // Store timer state in Redis
                    const timerState = {
                        mode,
                        remainingSeconds: durationSeconds,
                        totalSeconds: durationSeconds,
                        isRunning: true,
                        startedAt: Date.now(),
                    };

                    await RoomCache.setRoomState(roomId, { ...(await RoomCache.getRoomState(roomId) || {}), timer: timerState });

                    // Broadcast initial state
                    this._io.to(roomId).emit('timer:sync', { timerState });

                    // Clear any existing interval for this room
                    const existingInterval = timerIntervals.get(roomId);
                    if (existingInterval) clearInterval(existingInterval as any);

                    // Start countdown
                    const interval = setInterval(async () => {
                        const state = await RoomCache.getRoomState(roomId);
                        if (!state?.timer || !state.timer.isRunning) {
                            clearInterval(interval as any);
                            timerIntervals.delete(roomId);
                            return;
                        }

                        state.timer.remainingSeconds -= 1;

                        if (state.timer.remainingSeconds <= 0) {
                            state.timer.isRunning = false;
                            state.timer.remainingSeconds = 0;
                            clearInterval(interval as any);
                            timerIntervals.delete(roomId);
                            this._io.to(roomId).emit('timer:complete', { completedMode: state.timer.mode });
                        }

                        await RoomCache.setRoomState(roomId, state);
                        this._io.to(roomId).emit('timer:sync', { timerState: state.timer });
                    }, 1000);

                    timerIntervals.set(roomId, interval as any);
                    logger.info(`Timer started in room ${roomId}: ${durationSeconds}s ${mode}`);
                } catch (error) {
                    logger.error(`Error starting timer:`, error);
                }
            });

            socket.on('timer:pause', async (data: { roomId: string }) => {
                const { roomId } = data;
                try {
                    const state = await RoomCache.getRoomState(roomId);
                    if (state?.timer) {
                        state.timer.isRunning = false;
                        state.timer.pausedAt = Date.now();
                        await RoomCache.setRoomState(roomId, state);

                        const existingInterval = timerIntervals.get(roomId);
                        if (existingInterval) {
                            clearInterval(existingInterval as any);
                            timerIntervals.delete(roomId);
                        }

                        this._io.to(roomId).emit('timer:sync', { timerState: state.timer });
                        logger.info(`Timer paused in room ${roomId}`);
                    }
                } catch (error) {
                    logger.error(`Error pausing timer:`, error);
                }
            });

            socket.on('timer:reset', async (data: { roomId: string }) => {
                const { roomId } = data;
                try {
                    const state = await RoomCache.getRoomState(roomId);
                    if (state) {
                        delete state.timer;
                        await RoomCache.setRoomState(roomId, state);
                    }

                    const existingInterval = timerIntervals.get(roomId);
                    if (existingInterval) {
                        clearInterval(existingInterval as any);
                        timerIntervals.delete(roomId);
                    }

                    this._io.to(roomId).emit('timer:reset', {});
                    logger.info(`Timer reset in room ${roomId}`);
                } catch (error) {
                    logger.error(`Error resetting timer:`, error);
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
