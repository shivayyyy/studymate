import { z } from 'zod';

export const createPostSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(1000).optional(),
    contentType: z.enum(['NOTES', 'MNEMONICS', 'PYQ', 'CHEAT_SHEET', 'MIND_MAP', 'MISTAKE_LOG']),
    examCategory: z.enum(['JEE', 'NEET', 'UPSC', 'GATE']),
    subject: z.string().min(1, 'Subject is required'),
    tags: z.array(z.string().max(30)).max(10).optional(),
});

export const updatePostSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(1000).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
