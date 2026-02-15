import type { Request, Response } from 'express';
import { Post, Like, Comment, Save, User } from '@studymate/database';
import { asyncHandler, success, parsePagination } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class PostController {
    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const filter: any = { isActive: true };
        if (req.query.examCategory) filter.examCategory = req.query.examCategory;
        if (req.query.subject) filter.subject = req.query.subject;
        if (req.query.contentType) filter.contentType = req.query.contentType;
        if (req.query.userId) filter.userId = req.query.userId;

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'username fullName profilePicture');
        const total = await Post.countDocuments(filter);

        res.json(success(posts, 'Posts fetched', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const post = await Post.findById(req.params.id).populate('userId', 'username fullName profilePicture');
        if (!post) throw new AppError('Post not found', 404);
        res.json(success(post));
    });

    static create = asyncHandler(async (req: Request, res: Response) => {
        const post = await Post.create({ ...req.body, userId: req.user!.userId });
        await User.findByIdAndUpdate(req.user!.userId, { $inc: { postsCount: 1 } });
        res.status(201).json(success(post, 'Post created'));
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!.userId },
            req.body,
            { new: true },
        );
        if (!post) throw new AppError('Post not found or unauthorized', 404);
        res.json(success(post, 'Post updated'));
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!.userId },
            { isActive: false },
            { new: true },
        );
        if (!post) throw new AppError('Post not found or unauthorized', 404);
        res.json(success(null, 'Post deleted'));
    });

    static like = asyncHandler(async (req: Request, res: Response) => {
        const existing = await Like.findOne({ userId: req.user!.userId, postId: req.params.id });
        if (existing) throw new AppError('Already liked', 409);
        await Like.create({ userId: req.user!.userId, postId: req.params.id });
        await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: 1 } });
        res.json(success(null, 'Post liked'));
    });

    static unlike = asyncHandler(async (req: Request, res: Response) => {
        const result = await Like.findOneAndDelete({ userId: req.user!.userId, postId: req.params.id });
        if (!result) throw new AppError('Not liked', 404);
        await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: -1 } });
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
        await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
        res.status(201).json(success(comment, 'Comment added'));
    });

    static save = asyncHandler(async (req: Request, res: Response) => {
        const existing = await Save.findOne({ userId: req.user!.userId, postId: req.params.id });
        if (existing) throw new AppError('Already saved', 409);
        await Save.create({ userId: req.user!.userId, postId: req.params.id });
        await Post.findByIdAndUpdate(req.params.id, { $inc: { savesCount: 1 } });
        res.json(success(null, 'Post saved'));
    });

    static unsave = asyncHandler(async (req: Request, res: Response) => {
        const result = await Save.findOneAndDelete({ userId: req.user!.userId, postId: req.params.id });
        if (!result) throw new AppError('Not saved', 404);
        await Post.findByIdAndUpdate(req.params.id, { $inc: { savesCount: -1 } });
        res.json(success(null, 'Post unsaved'));
    });
}
