import type { Request, Response } from 'express';
import { StudySession } from '@studymate/database';
import { asyncHandler, success, parsePagination } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class SessionController {
    static startSession = asyncHandler(async (req: Request, res: Response) => {
        const { roomId } = req.body;
        const userId = req.user!.userId;

        // Check for existing active session
        const existing = await StudySession.findOne({ userId, isActive: true });
        if (existing) throw new AppError('You already have an active session', 409);

        const session = await StudySession.create({ userId, roomId, startTime: new Date() });
        res.status(201).json(success(session, 'Session started'));
    });

    static endSession = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        const session = await StudySession.findOneAndUpdate(
            { userId, isActive: true },
            { endTime: new Date(), isActive: false },
            { new: true },
        );
        if (!session) throw new AppError('No active session found', 404);

        // Trigger save to calculate duration via pre-save hook
        await session.save();

        res.json(success(session, 'Session ended'));
    });

    static getActiveSession = asyncHandler(async (req: Request, res: Response) => {
        const session = await StudySession.findOne({ userId: req.user!.userId, isActive: true })
            .populate('roomId', 'name examCategory subject');
        res.json(success(session));
    });

    static getSessionHistory = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const sessions = await StudySession.find({ userId: req.user!.userId, isActive: false })
            .sort({ startTime: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('roomId', 'name examCategory subject');
        const total = await StudySession.countDocuments({ userId: req.user!.userId, isActive: false });
        res.json(success(sessions, 'Session history', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });
}
