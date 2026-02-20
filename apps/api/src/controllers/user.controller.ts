import type { Request, Response } from 'express';
import { User, Follow, Post, Save } from '@studymate/database';
import { UserCache } from '@studymate/cache';
import { asyncHandler, success, parsePagination } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class UserController {
    static getMe = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        // Check cache first
        const cached = await UserCache.getProfile(userId);
        if (cached) return res.json(success(cached));

        const user = await User.findById(userId).select('-passwordHash');
        if (!user) throw new AppError('User not found', 404);

        await UserCache.setProfile(userId, user.toObject());
        res.json(success(user));
    });

    static updateMe = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const user = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true,
        }).select('-passwordHash');
        if (!user) throw new AppError('User not found', 404);

        // Invalidate user cache
        await UserCache.invalidateProfile(userId);

        res.json(success(user, 'Profile updated'));
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.id as string;

        // Check cache first
        const cached = await UserCache.getProfile(userId);
        if (cached) return res.json(success(cached));

        const user = await User.findById(userId).select('-passwordHash');
        if (!user) throw new AppError('User not found', 404);

        await UserCache.setProfile(userId, user.toObject());
        res.json(success(user));
    });

    static search = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const q = (req.query.q as string) || '';
        if (q.trim().length === 0) throw new AppError('Search query is required', 400);

        const filter: Record<string, any> = {
            isActive: true,
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { fullName: { $regex: q, $options: 'i' } },
            ],
        };
        if (req.query.examCategory) filter.examCategory = req.query.examCategory as string;

        const users = await User.find(filter)
            .select('-passwordHash')
            .sort({ followersCount: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await User.countDocuments(filter);

        res.json(success(users, 'Users found', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static follow = asyncHandler(async (req: Request, res: Response) => {
        const followerId = req.user!.userId;
        const followingId = req.params.id;
        if (followerId === followingId) throw new AppError('Cannot follow yourself', 400);

        const existing = await Follow.findOne({ followerId, followingId });
        if (existing) throw new AppError('Already following', 409);

        await Follow.create({ followerId, followingId });
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

        res.json(success(null, 'Followed successfully'));
    });

    static unfollow = asyncHandler(async (req: Request, res: Response) => {
        const followerId = req.user!.userId;
        const followingId = req.params.id;

        const result = await Follow.findOneAndDelete({ followerId, followingId });
        if (!result) throw new AppError('Not following this user', 404);

        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });

        res.json(success(null, 'Unfollowed successfully'));
    });

    static getFollowers = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const follows = await Follow.find({ followingId: req.params.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('followerId', 'username fullName profilePicture');
        const total = await Follow.countDocuments({ followingId: req.params.id });
        res.json(success(follows, 'Followers fetched', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static getFollowing = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const follows = await Follow.find({ followerId: req.params.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('followingId', 'username fullName profilePicture');
        const total = await Follow.countDocuments({ followerId: req.params.id });
        res.json(success(follows, 'Following fetched', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static getUserPosts = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const userId = req.params.id;

        const posts = await Post.find({ userId, isActive: true })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'username fullName profilePicture');

        const total = await Post.countDocuments({ userId, isActive: true });

        res.json(success(posts, 'User posts fetched', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static getUserSaved = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const userId = req.params.id;

        // Verify user exists first? Optional but good.

        const savedItems = await Save.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: 'postId',
                populate: { path: 'userId', select: 'username fullName profilePicture' }
            });

        const total = await Save.countDocuments({ userId });

        res.json(success(savedItems, 'Saved items fetched', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static checkUsernameAvailability = asyncHandler(async (req: Request, res: Response) => {
        const { username } = req.query;
        if (!username || typeof username !== 'string') {
            throw new AppError('Username is required', 400);
        }

        const { usernameBloomFilter } = await import('../lib/bloom');

        // Check Bloom Filter first (Source of Truth for availability)
        const isTaken = await usernameBloomFilter.exists(username);

        if (isTaken) {
            // Bloom filter says yes: It MIGHT be taken (false positive possible but rare)
            // But per instructions: "If 1 (Found): You tell the user 'Username Taken.' You do not check the database."
            res.json(success({ available: false }, 'Username taken'));
            return;
        }

        // Bloom filter says no: It is DEFINITELY available
        res.json(success({ available: true }, 'Username available'));
    });
}
