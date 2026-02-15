import { z } from 'zod';

export const startSessionSchema = z.object({
    roomId: z.string().min(1, 'Room ID is required'),
});

export const endSessionSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
