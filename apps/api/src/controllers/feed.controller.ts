import type { Request, Response } from 'express';
import { Post, Follow, Save } from '@studymate/database';
import { FeedCache } from '@studymate/cache';
import { asyncHandler, success, parsePagination } from '@studymate/utils';

export class FeedController {
    static getTrending = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const exam = (req.query.examCategory as string) || 'all';

        // Check cache first (only for first page)
        if (page === 1) {
            const cached = await FeedCache.getTrendingPosts(exam);
            if (cached) {
                return res.json(success(cached, 'Trending feed (cached)'));
            }
        }

        const filter: any = { isActive: true };
        if (req.query.examCategory) filter.examCategory = req.query.examCategory;

        const posts = await Post.find(filter)
            .sort({ engagementScore: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'username fullName profilePicture');
        const total = await Post.countDocuments(filter);

        // Cache first page of results
        if (page === 1) {
            await FeedCache.setTrendingPosts(exam, posts);
        }

        res.json(success(posts, 'Trending feed', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static getFollowing = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const userId = req.user!.userId;

        // Check cache first (only for first page)
        if (page === 1) {
            const cached = await FeedCache.getUserFeed(userId);
            if (cached) {
                return res.json(success(cached, 'Following feed (cached)'));
            }
        }

        const following = await Follow.find({ followerId: userId }).select('followingId');
        const followingIds = following.map((f) => f.followingId);

        const posts = await Post.find({ userId: { $in: followingIds }, isActive: true })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'username fullName profilePicture');
        const total = await Post.countDocuments({ userId: { $in: followingIds }, isActive: true });

        // Cache first page
        if (page === 1) {
            await FeedCache.setUserFeed(userId, posts);
        }

        res.json(success(posts, 'Following feed', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static getSaved = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const userId = req.user!.userId;

        const saved = await Save.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: 'postId',
                populate: { path: 'userId', select: 'username fullName profilePicture' },
            });
        const total = await Save.countDocuments({ userId });

        const posts = saved.map((s) => s.postId);
        res.json(success(posts, 'Saved posts', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });
}
