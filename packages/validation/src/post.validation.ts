import { z } from 'zod';

export const createPostSchema = z.object({
    title: z.string().trim().max(200).optional(),
    description: z.string().max(1000).optional(),
    examCategory: z.enum(['JEE', 'NEET', 'UPSC', 'GATE']),
    subject: z.string().min(1),
    tags: z.array(z.string()).optional(),
    fileUrl: z.string().url().optional(),
    fileUrls: z.array(z.string().url()).optional(),
    thumbnailUrl: z.string().url().optional()
}).refine(data => data.title || data.description, {
    message: "Either title or description must be provided",
    path: ["description"]
});

export const updatePostSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(1000).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
