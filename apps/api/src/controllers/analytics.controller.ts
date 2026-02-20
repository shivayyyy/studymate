import type { Request, Response } from 'express';
import { calculateUserStats, getLeaderboard, getUserRank } from '@studymate/analytics';
import { asyncHandler, success } from '@studymate/utils';

export class AnalyticsController {
    static getUserStats = asyncHandler(async (req: Request, res: Response) => {
        const stats = await calculateUserStats(req.user!.userId);
        res.json(success(stats, 'User stats'));
    });

    static getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
        const exam = (req.query.examCategory as string) || 'JEE';
        const limit = parseInt(req.query.limit as string) || 100;
        const leaders = await getLeaderboard(exam, limit);

        // Hydrate with user details
        const userIds = leaders.map(l => l.userId);
        // @ts-ignore - User model is available globally or via import, but to be safe lets use dynamic import or assumption if not imported. 
        // Actually, I should import User model. Let me check imports first.
        // Wait, I can't check imports here easily without breaking flow. 
        // I will add the import in a separate chunk or just assume it needs to be added.
        // Let's use the explicit import in the file top.

        // Fetch users
        const { User } = await import('@studymate/database');
        const users = await User.find({ _id: { $in: userIds } })
            .select('fullName username profilePicture')
            .lean();

        // Create a map for O(1) lookup
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        // Merge
        const hydratedLeaders = leaders.map(leader => {
            const user = userMap.get(leader.userId);
            return {
                ...leader,
                user: user ? {
                    _id: user._id,
                    fullName: user.fullName,
                    username: user.username,
                    profilePicture: user.profilePicture
                } : null
            };
        }).filter(item => item.user !== null); // Filter out users that might have been deleted

        res.json(success(hydratedLeaders, 'Leaderboard'));
    });

    static getUserRank = asyncHandler(async (req: Request, res: Response) => {
        const exam = (req.query.examCategory as string) || 'JEE';
        const rank = await getUserRank(exam, req.user!.userId);
        res.json(success({ rank }, 'User rank'));
    });
}
