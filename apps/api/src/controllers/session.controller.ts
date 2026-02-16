import type { Request, Response } from 'express';
import { StudySession, Room } from '@studymate/database';
import { SessionCache } from '@studymate/cache';
import { updateUserStudyStats } from '@studymate/analytics';
import { asyncHandler, success, parsePagination } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class SessionController {
    static startSession = asyncHandler(async (req: Request, res: Response) => {
        const { roomId } = req.body;
        const userId = req.user!.userId;

        // Check for existing active session
        const existing = await StudySession.findOne({ userId, isActive: true });
        if (existing) throw new AppError('You already have an active session', 409);

        // Verify room exists and is active
        const room = await Room.findById(roomId);
        if (!room || !room.isActive) throw new AppError('Room not found or inactive', 404);
        if (room.currentOccupancy >= room.maxOccupancy) throw new AppError('Room is full', 409);

        const session = await StudySession.create({ userId, roomId, startTime: new Date() });

        // Increment room occupancy in DB
        await Room.findByIdAndUpdate(roomId, { $inc: { currentOccupancy: 1 } });

        // Cache the active session
        await SessionCache.setActiveSession(userId, session.toObject());

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

        // Decrement room occupancy in DB
        await Room.findByIdAndUpdate(session.roomId, {
            $inc: { currentOccupancy: -1 },
        });

        // Update user study stats (totalStudyHours, streaks, leaderboard)
        if (session.durationMinutes && session.durationMinutes > 0) {
            await updateUserStudyStats(userId, session.durationMinutes);
        }

        // Clear cached active session
        await SessionCache.clearActiveSession(userId);

        res.json(success(session, 'Session ended'));
    });

    static getActiveSession = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        // Check cache first
        const cached = await SessionCache.getActiveSession(userId);
        if (cached) {
            return res.json(success(cached));
        }

        const session = await StudySession.findOne({ userId, isActive: true })
            .populate('roomId', 'name examCategory subject');

        // Cache it if found
        if (session) {
            await SessionCache.setActiveSession(userId, session.toObject());
        }

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
