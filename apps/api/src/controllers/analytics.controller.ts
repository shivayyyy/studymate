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
        res.json(success(leaders, 'Leaderboard'));
    });

    static getUserRank = asyncHandler(async (req: Request, res: Response) => {
        const exam = (req.query.examCategory as string) || 'JEE';
        const rank = await getUserRank(exam, req.user!.userId);
        res.json(success({ rank }, 'User rank'));
    });
}
