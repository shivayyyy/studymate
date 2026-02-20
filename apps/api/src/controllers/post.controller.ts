import type { Request, Response } from 'express';
import { Post, Like, Comment, Save, User } from '@studymate/database';
import { FeedCache, connectRedis } from '@studymate/cache';
import { asyncHandler, success, parsePagination } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class PostController {
    static getAll = asyncHandler(async (req: Request, res: Response) => {
        // Check if this is a feed request
        const { type, cursor, limit } = req.query;
        if (type === 'latest' || type === 'trending' || type === 'subject' || type === 'tag') {
            const { FeedService } = await import('../services/feed.service');
            const result = await FeedService.getFeed({
                examCategory: req.query.examCategory as string,
                type: type as any,
                value: (req.query.subject || req.query.tag) as string,
                userId: req.user?.userId,
                cursor: cursor ? Number(cursor) : undefined,
                limit: limit ? Number(limit) : 20
            });
            res.json(success(result.posts, 'Feed fetched', { nextCursor: result.nextCursor }));
            return;
        }

        const { page: pageNum, limit: limitNum } = parsePagination(req.query as any);
        const filter: any = { isActive: true };
        if (req.query.examCategory) filter.examCategory = req.query.examCategory;
        if (req.query.subject) filter.subject = req.query.subject;
        if (req.query.contentType) filter.contentType = req.query.contentType;
        if (req.query.userId) filter.userId = req.query.userId;

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('userId', 'username fullName profilePicture');
        const total = await Post.countDocuments(filter);

        res.json(success(posts, 'Posts fetched', { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }));
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const { FeedService } = await import('../services/feed.service');
        let post = await FeedService.getCachedPost(req.params.id as string);

        if (!post) {
            post = await Post.findById(req.params.id).populate('userId', 'username fullName profilePicture');
            if (!post) throw new AppError('Post not found', 404);
            await FeedService.cachePost(post);
        }

        res.json(success(post));
    });

    static create = asyncHandler(async (req: Request, res: Response) => {
        const { description, examCategory, subject, tags, fileUrl, fileUrls, thumbnailUrl } = req.body;

        // Fetch full user details
        const user = await User.findById(req.user?.userId);
        if (!user) throw new AppError('User not found', 404);

        const post = await Post.create({
            userId: user._id,
            description,
            examCategory,
            subject,
            tags,
            fileUrl,
            fileUrls,
            thumbnailUrl,
            authorName: user.fullName,
            authorUsername: user.username,
            authorProfilePicture: user.profilePicture
        });

        // Add to Feed (Async)
        const { FeedService } = await import('../services/feed.service');
        await FeedService.addPost(post);

        res.status(201).json(success(post, 'Post created successfully'));
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!.userId },
            req.body,
            { new: true },
        ).populate('userId', 'username fullName profilePicture'); // Populate for cache consistency
        if (!post) throw new AppError('Post not found or unauthorized', 404);

        // Update cache
        const { FeedService } = await import('../services/feed.service');
        await FeedService.cachePost(post);
        // Note: If critical fields like tags/subject change, we should technically remove from old feeds and add to new.
        // For now, we assume simple updates.

        res.json(success(post, 'Post updated'));
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!.userId },
            { isActive: false },
            { new: true },
        );
        if (!post) throw new AppError('Post not found or unauthorized', 404);

        const { FeedService } = await import('../services/feed.service');
        await FeedService.removePost(post);

        res.json(success(null, 'Post deleted'));
    });

    static like = asyncHandler(async (req: Request, res: Response) => {
        const existing = await Like.findOne({ userId: req.user!.userId, postId: req.params.id });
        if (existing) throw new AppError('Already liked', 409);
        await Like.create({ userId: req.user!.userId, postId: req.params.id });
        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: 1 } }, { new: true });

        // Update Engagement in Feed
        if (post) {
            // Update Redis Likes Set
            const client = await connectRedis();
            const { RedisKeys } = await import('@studymate/config');
            await client.sAdd(RedisKeys.postLikes(post._id.toString()), req.user!.userId);

            // Re-save to trigger pre-save hook for engagementScore calculation
            const p = await Post.findById(post._id);
            if (p) {
                await p.save(); // Triggers engagement score calc + update
                const { FeedService } = await import('../services/feed.service');
                await FeedService.updateEngagement(p);
            }
        }
        res.json(success(null, 'Post liked'));
    });

    static unlike = asyncHandler(async (req: Request, res: Response) => {
        const result = await Like.findOneAndDelete({ userId: req.user!.userId, postId: req.params.id });
        if (!result) throw new AppError('Not liked', 404);
        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: -1 } }, { new: true });

        if (post) {
            // Update Redis Likes Set
            const client = await connectRedis();
            const { RedisKeys } = await import('@studymate/config');
            await client.sRem(RedisKeys.postLikes(post._id.toString()), req.user!.userId);

            const p = await Post.findById(post._id);
            if (p) {
                await p.save();
                const { FeedService } = await import('../services/feed.service');
                await FeedService.updateEngagement(p);
            }
        }
        res.json(success(null, 'Post unliked'));
    });

    static getComments = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const comments = await Comment.find({ postId: req.params.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'username fullName profilePicture');
        const total = await Comment.countDocuments({ postId: req.params.id });
        res.json(success(comments, 'Comments fetched', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static addComment = asyncHandler(async (req: Request, res: Response) => {
        const comment = await Comment.create({ userId: req.user!.userId, postId: req.params.id, content: req.body.content });
        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } }, { new: true });
        if (post) {
            const p = await Post.findById(post._id);
            if (p) {
                await p.save();
                const { FeedService } = await import('../services/feed.service');
                await FeedService.updateEngagement(p);
            }
        }
        res.status(201).json(success(comment, 'Comment added'));
    });

    static deleteComment = asyncHandler(async (req: Request, res: Response) => {
        const comment = await Comment.findOneAndDelete({
            _id: req.params.commentId,
            userId: req.user!.userId,
        });
        if (!comment) throw new AppError('Comment not found or unauthorized', 404);

        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: -1 } }, { new: true });
        if (post) {
            const p = await Post.findById(post._id);
            if (p) {
                await p.save();
                const { FeedService } = await import('../services/feed.service');
                await FeedService.updateEngagement(p);
            }
        }
        res.json(success(null, 'Comment deleted'));
    });

    static save = asyncHandler(async (req: Request, res: Response) => {
        const existing = await Save.findOne({ userId: req.user!.userId, postId: req.params.id });
        if (existing) throw new AppError('Already saved', 409);
        await Save.create({ userId: req.user!.userId, postId: req.params.id });
        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { savesCount: 1 } }, { new: true });
        if (post) {
            const p = await Post.findById(post._id);
            if (p) {
                await p.save();
                const { FeedService } = await import('../services/feed.service');
                await FeedService.updateEngagement(p);
            }
        }
        res.json(success(null, 'Post saved'));
    });

    static unsave = asyncHandler(async (req: Request, res: Response) => {
        const result = await Save.findOneAndDelete({ userId: req.user!.userId, postId: req.params.id });
        if (!result) throw new AppError('Not saved', 404);
        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { savesCount: -1 } }, { new: true });
        if (post) {
            const p = await Post.findById(post._id);
            if (p) {
                await p.save();
                const { FeedService } = await import('../services/feed.service');
                await FeedService.updateEngagement(p);
            }
        }
        res.json(success(null, 'Post unsaved'));
    });
}
