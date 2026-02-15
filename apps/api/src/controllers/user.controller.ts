import type { Request, Response } from 'express';
import { User, Follow } from '@studymate/database';
import { asyncHandler, success, parsePagination } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class UserController {
    static getMe = asyncHandler(async (req: Request, res: Response) => {
        const user = await User.findById(req.user!.userId).select('-passwordHash');
        if (!user) throw new AppError('User not found', 404);
        res.json(success(user));
    });

    static updateMe = asyncHandler(async (req: Request, res: Response) => {
        const user = await User.findByIdAndUpdate(req.user!.userId, req.body, {
            new: true,
            runValidators: true,
        }).select('-passwordHash');
        if (!user) throw new AppError('User not found', 404);
        res.json(success(user, 'Profile updated'));
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) throw new AppError('User not found', 404);
        res.json(success(user));
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
}
