import { z } from 'zod';

export const updateUserSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    profilePicture: z.string().url().optional(),
    examCategory: z.enum(['JEE', 'NEET', 'UPSC', 'GATE']).optional(),
    subjects: z.array(z.string()).min(1).optional(),
    targetYear: z.number().int().min(2024).max(2030).optional(),
    bio: z.string().max(200).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
