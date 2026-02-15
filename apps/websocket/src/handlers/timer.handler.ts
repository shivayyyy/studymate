import type { Server, Socket } from 'socket.io';
import { CacheManager } from '@studymate/cache';
import { RedisKeys } from '@studymate/config';
import { createLogger } from '@studymate/logger';
import type { TimerPhase } from '@studymate/types';

const logger = createLogger('timer-handler');

interface TimerState {
    mode: TimerPhase;
    remainingSeconds: number;
    totalSeconds: number;
    isRunning: boolean;
    startedAt?: number;
}

export const registerTimerHandlers = (io: Server, socket: Socket) => {
    const startTimer = async (data: { roomId: string; durationSeconds: number; mode: TimerPhase }) => {
        const { roomId, durationSeconds, mode } = data;

        const timerState: TimerState = {
            mode,
            remainingSeconds: durationSeconds,
            totalSeconds: durationSeconds,
            isRunning: true,
            startedAt: Date.now(),
        };

        await CacheManager.set(RedisKeys.roomTimer(roomId), timerState, 7200);
        io.to(roomId).emit('timer:sync', { roomId, timerState });
        logger.info(`Timer started in room ${roomId}: ${mode} for ${durationSeconds}s`);
    };

    const pauseTimer = async (data: { roomId: string }) => {
        const { roomId } = data;
        const timerState = await CacheManager.get<TimerState>(RedisKeys.roomTimer(roomId));
        if (!timerState) return;

        const elapsed = Math.floor((Date.now() - (timerState.startedAt || 0)) / 1000);
        timerState.remainingSeconds = Math.max(0, timerState.remainingSeconds - elapsed);
        timerState.isRunning = false;
        timerState.startedAt = undefined;

        await CacheManager.set(RedisKeys.roomTimer(roomId), timerState, 7200);
        io.to(roomId).emit('timer:sync', { roomId, timerState });
    };

    const resetTimer = async (data: { roomId: string }) => {
        const { roomId } = data;
        await CacheManager.del(RedisKeys.roomTimer(roomId));
        io.to(roomId).emit('timer:reset', { roomId });
    };

    const syncTimer = async (data: { roomId: string }) => {
        const { roomId } = data;
        const timerState = await CacheManager.get<TimerState>(RedisKeys.roomTimer(roomId));
        if (timerState) {
            socket.emit('timer:sync', { roomId, timerState });
        }
    };

    socket.on('timer:start', startTimer);
    socket.on('timer:pause', pauseTimer);
    socket.on('timer:reset', resetTimer);
    socket.on('timer:sync', syncTimer);
};
