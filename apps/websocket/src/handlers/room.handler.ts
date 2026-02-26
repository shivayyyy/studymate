import type { Server, Socket } from 'socket.io';
import { RoomCache, CacheManager } from '@studymate/cache';
import { Room, RoomMessage, User } from '@studymate/database';
import { createLogger } from '@studymate/logger';
import { RedisKeys } from '@studymate/config';

const logger = createLogger('room-handler');

// In-memory tracking for active (unmuted) mic sessions per socket
// Key: `${roomId}:${userId}`, Value: unmute start timestamp
const unmuteTimestamps = new Map<string, number>();
// Key: `${roomId}:${userId}`, Value: interval ID for periodic 15% checks
const micCheckIntervals = new Map<string, ReturnType<typeof setInterval>>();

const MIC_TIME_LIMIT_MS = 5 * 60 * 1000; // 5 minutes fixed limit
const MIC_CHECK_INTERVAL_MS = 5000; // Check every 5 seconds



/**
 * Checks if a user has exceeded the global 5-minute mic time limit.
 * Returns { exceeded, usedMs, limitMs }.
 */
async function checkMicTimeLimit(
    roomId: string,
    userId: string,
    activeUnmuteStart?: number
): Promise<{ exceeded: boolean; usedMs: number; limitMs: number } | null> {
    const limitMs = MIC_TIME_LIMIT_MS;
    let usedMs = await RoomCache.getMicTimeUsed(roomId, userId);

    // Add currently active unmute duration if mic is currently on
    if (activeUnmuteStart) {
        usedMs += Date.now() - activeUnmuteStart;
    }

    return { exceeded: usedMs >= limitMs, usedMs, limitMs };
}

export const registerRoomHandlers = (io: Server, socket: Socket) => {
    const joinRoom = async (data: { roomId: string }) => {
        const { roomId } = data;
        const userId = socket.data.userId;
        const username = socket.data.username;

        const usersInRoom = await RoomCache.getRoomUsers(roomId);
        const isAlreadyInRoom = usersInRoom.includes(userId);

        socket.join(roomId);

        if (!isAlreadyInRoom) {
            await RoomCache.addUserToRoom(roomId, userId);
            await RoomCache.incrementOccupancy(roomId);
        }

        const users = await RoomCache.getRoomUsers(roomId);

        // Fetch User profiles for current occupants to get usernames
        const userDocs = await User.find(
            { _id: { $in: users } },
            'username profilePicture'
        ).lean();

        const formattedUsers = users.map(uid => {
            const doc = userDocs.find((d: any) => d._id?.toString() === uid);
            return {
                userId: uid,
                username: doc?.username || 'Unknown User'
            };
        });

        // Fetch last 50 messages for persistent chat
        const messages = await RoomMessage.find({ roomId })
            .sort({ timestamp: -1 })
            .limit(50);

        const history = messages.reverse().map(msg => ({
            id: msg._id.toString(),
            roomId: msg.roomId.toString(),
            userId: msg.userId.toString(),
            username: msg.username,
            content: msg.content,
            timestamp: msg.timestamp.getTime(),
        }));

        if (!isAlreadyInRoom) {
            socket.to(roomId).emit('room:user-joined', {
                userId,
                username,
                occupancy: users.length,
            });
        }

        socket.emit('room:joined', {
            roomId,
            users: formattedUsers,
            occupancy: users.length,
            history, // Send chat history
        });

        if (!isAlreadyInRoom) {
            logger.info(`User ${username} joined room ${roomId}`);
        } else {
            logger.info(`User ${username} re-joined room ${roomId} (already present)`);
        }
    };

    // Helper: clean up mic tracking for a user in a room
    const cleanupMicTracking = async (roomId: string, userId: string) => {
        const key = `${roomId}:${userId}`;
        const unmuteStart = unmuteTimestamps.get(key);

        // If mic was active, finalize the accumulated time
        if (unmuteStart) {
            const elapsed = Date.now() - unmuteStart;
            await RoomCache.incrMicTime(roomId, userId, elapsed);
            unmuteTimestamps.delete(key);
        }

        // Clear periodic check interval
        const interval = micCheckIntervals.get(key);
        if (interval) {
            clearInterval(interval);
            micCheckIntervals.delete(key);
        }
    };

    const leaveRoom = async (data: { roomId: string }) => {
        const { roomId } = data;
        const userId = socket.data.userId;

        // Clean up mic tracking before leaving
        await cleanupMicTracking(roomId, userId);
        // Clean up Redis mic time entry
        await RoomCache.resetMicTime(roomId, userId);

        socket.leave(roomId);
        await RoomCache.removeUserFromRoom(roomId, userId);
        await RoomCache.decrementOccupancy(roomId);

        const users = await RoomCache.getRoomUsers(roomId);

        socket.to(roomId).emit('room:user-left', {
            userId,
            occupancy: users.length,
        });

        logger.info(`User ${socket.data.username} left room ${roomId}`);

        // Check if leaving user is the owner
        try {
            const room = await Room.findById(roomId);
            if (room && room.ownerId?.toString() === userId) {
                const remainingUsers = await RoomCache.getRoomUsers(roomId);

                if (remainingUsers.length > 0) {
                    const newOwnerId = remainingUsers[0];
                    room.ownerId = newOwnerId as any;
                    room.isOwnerless = false;
                    await room.save();

                    io.to(roomId).emit('room:owner-changed', {
                        previousOwnerId: userId,
                        newOwnerId,
                    });
                } else {
                    room.isOwnerless = true;
                    await room.save();
                }
            }
        } catch (error) {
            logger.error(`Error handling owner disconnect for room ${roomId}:`, error);
        }
    };

    socket.on('room:join', joinRoom);
    socket.on('room:leave', leaveRoom);

    const toggleFocusMode = async (data: { roomId: string; enabled: boolean }) => {
        const { roomId, enabled } = data;
        const userId = socket.data.userId;

        try {
            const room = await Room.findById(roomId);
            if (!room || room.ownerId?.toString() !== userId) {
                socket.emit('room:error', { message: 'Only the room owner can toggle focus mode' });
                return;
            }

            room.settings.focusModeEnabled = enabled;
            await room.save();

            const currentState = await RoomCache.getRoomState(roomId) || {};
            await RoomCache.setRoomState(roomId, {
                ...currentState,
                focusModeEnabled: enabled,
            });

            io.to(roomId).emit('room:focus-mode-changed', {
                roomId,
                enabled,
                changedBy: socket.data.username,
            });

            logger.info(`Focus mode ${enabled ? 'enabled' : 'disabled'} in room ${roomId} by ${socket.data.username}`);
        } catch (error) {
            logger.error(`Error toggling focus mode for room ${roomId}:`, error);
        }
    };

    const transferOwnership = async (data: { roomId: string; newOwnerId: string }) => {
        const { roomId, newOwnerId } = data;
        const userId = socket.data.userId;

        try {
            const room = await Room.findById(roomId);
            if (!room || room.ownerId?.toString() !== userId) {
                socket.emit('room:error', { message: 'Only the room owner can transfer ownership' });
                return;
            }

            room.ownerId = newOwnerId as any;
            await room.save();

            io.to(roomId).emit('room:owner-changed', {
                previousOwnerId: userId,
                newOwnerId,
            });
        } catch (error) {
            logger.error(`Error transferring ownership for room ${roomId}:`, error);
        }
    };

    const kickUser = async (data: { roomId: string; targetUserId: string }) => {
        const { roomId, targetUserId } = data;
        const userId = socket.data.userId;

        try {
            const room = await Room.findById(roomId);
            if (!room || room.ownerId?.toString() !== userId) {
                socket.emit('room:error', { message: 'Only the room owner can kick users' });
                return;
            }

            io.to(roomId).emit('room:user-kicked', {
                userId: targetUserId,
                reason: 'Kicked by owner'
            });
        } catch (error) {
            logger.error(`Error kicking user in room ${roomId}:`, error);
        }
    };

    // ==================== Mic Time Tracking ====================

    const enforceMicLimit = async (roomId: string, userId: string) => {
        const key = `${roomId}:${userId}`;
        const unmuteStart = unmuteTimestamps.get(key);

        // Finalize current active session
        if (unmuteStart) {
            const elapsed = Date.now() - unmuteStart;
            await RoomCache.incrMicTime(roomId, userId, elapsed);
            unmuteTimestamps.delete(key);
        }

        // Stop periodic checks
        const interval = micCheckIntervals.get(key);
        if (interval) {
            clearInterval(interval);
            micCheckIntervals.delete(key);
        }

        const totalUsedMs = await RoomCache.getMicTimeUsed(roomId, userId);
        const limitMs = MIC_TIME_LIMIT_MS;

        // Emit personal focus mode to this user only
        socket.emit('room:personal-focus-mode', {
            enabled: true,
            reason: 'mic_time_exceeded',
            usedSeconds: Math.round(totalUsedMs / 1000),
            limitSeconds: Math.round(limitMs / 1000),
        });

        // Force-mute the user for everyone in the room
        socket.to(roomId).emit('audio:user-muted', {
            userId,
            isMuted: true,
        });

        logger.info(`Mic time limit exceeded for user ${userId} in room ${roomId} — personal focus mode activated (used: ${Math.round(totalUsedMs / 1000)}s, limit: ${Math.round(limitMs / 1000)}s)`);
    };

    const audioMuteToggle = async (data: { roomId: string; isMuted: boolean }) => {
        const { roomId, isMuted } = data;
        const userId = socket.data.userId;
        const key = `${roomId}:${userId}`;

        // Broadcast mute state to other users
        socket.to(roomId).emit('audio:user-muted', {
            userId,
            isMuted,
        });

        if (!isMuted) {
            // === User UNMUTED ===
            // Record the unmute start time
            unmuteTimestamps.set(key, Date.now());

            // Start periodic check for 15% limit
            const intervalId = setInterval(async () => {
                try {
                    const result = await checkMicTimeLimit(roomId, userId, unmuteTimestamps.get(key));
                    if (result && result.exceeded) {
                        await enforceMicLimit(roomId, userId);
                    } else if (result) {
                        // Send mic time update to the user for their UI
                        socket.emit('mic:time-update', {
                            usedMs: result.usedMs,
                            limitMs: result.limitMs,
                        });
                    }
                } catch (err) {
                    logger.error(`Error in mic time check for ${userId} in ${roomId}:`, err);
                }
            }, MIC_CHECK_INTERVAL_MS);

            micCheckIntervals.set(key, intervalId);

            // Immediate first check (user may already be over the limit from prior sessions)
            try {
                const result = await checkMicTimeLimit(roomId, userId, unmuteTimestamps.get(key));
                if (result && result.exceeded) {
                    await enforceMicLimit(roomId, userId);
                } else if (result) {
                    socket.emit('mic:time-update', {
                        usedMs: result.usedMs,
                        limitMs: result.limitMs,
                    });
                }
            } catch (err) {
                logger.error(`Error in initial mic time check for ${userId}:`, err);
            }
        } else {
            // === User MUTED ===
            const unmuteStart = unmuteTimestamps.get(key);
            if (unmuteStart) {
                const elapsed = Date.now() - unmuteStart;
                const totalUsedMs = await RoomCache.incrMicTime(roomId, userId, elapsed);
                unmuteTimestamps.delete(key);

                // Send updated mic time to the user
                const limitMs = MIC_TIME_LIMIT_MS;
                socket.emit('mic:time-update', {
                    usedMs: totalUsedMs,
                    limitMs,
                });
            }

            // Clear periodic check interval
            const interval = micCheckIntervals.get(key);
            if (interval) {
                clearInterval(interval);
                micCheckIntervals.delete(key);
            }
        }
    };

    socket.on('room:focus-mode', toggleFocusMode);
    socket.on('room:transfer-ownership', transferOwnership);
    socket.on('room:kick-user', kickUser);
    socket.on('audio:mute-toggle', audioMuteToggle);

    // Handle disconnection — leave all rooms
    socket.on('disconnecting', async () => {
        for (const roomId of socket.rooms) {
            if (roomId !== socket.id) {
                await leaveRoom({ roomId });
            }
        }
    });
};
