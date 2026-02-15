import { z } from 'zod';

export const createRoomSchema = z.object({
    name: z.string().min(3, 'Room name must be at least 3 characters').max(100),
    examCategory: z.enum(['JEE', 'NEET', 'UPSC', 'GATE']),
    subject: z.string().min(1, 'Subject is required'),
    timerMode: z.enum(['POMODORO_25_5', 'EXTENDED_45_10', 'LONG_90_20', 'CUSTOM']),
    customTimerConfig: z
        .object({
            focusMinutes: z.number().int().min(1).max(120),
            breakMinutes: z.number().int().min(1).max(60),
        })
        .optional(),
    maxOccupancy: z.number().int().min(2).max(500).optional(),
});

export const joinRoomSchema = z.object({
    roomId: z.string().min(1, 'Room ID is required'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
