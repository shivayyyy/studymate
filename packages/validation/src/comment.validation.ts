import { z } from 'zod';

export const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment is too long'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
