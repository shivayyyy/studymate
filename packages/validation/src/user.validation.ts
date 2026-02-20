import { z } from 'zod';

export const updateUserSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    profilePicture: z.string().url().optional(),
    examCategory: z.enum(['JEE', 'NEET', 'UPSC', 'GATE']).optional(),
    subjects: z.array(z.string()).min(1).optional(),
    targetYear: z.number().int().min(2024).max(2030).optional(),
    bio: z.string().max(200).optional(),
    dailyStudyGoal: z.number().min(1).max(24).optional(),
    timerPreference: z.object({
        mode: z.enum(['POMODORO', 'EXTENDED', 'DEEP', 'CUSTOM']),
        focusDuration: z.number().min(1).max(180),
        breakDuration: z.number().min(1).max(60),
    }).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
