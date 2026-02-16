import type { Request, Response } from 'express';
import { Room } from '@studymate/database';
import { asyncHandler, success, parsePagination } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class RoomController {
    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = parsePagination(req.query as any);
        const filter: any = { isActive: true };
        if (req.query.examCategory) filter.examCategory = req.query.examCategory;
        if (req.query.subject) filter.subject = req.query.subject;

        const rooms = await Room.find(filter)
            .sort({ currentOccupancy: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Room.countDocuments(filter);

        res.json(success(rooms, 'Rooms fetched', { page, limit, total, totalPages: Math.ceil(total / limit) }));
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const room = await Room.findById(req.params.id);
        if (!room) throw new AppError('Room not found', 404);
        res.json(success(room));
    });

    static create = asyncHandler(async (req: Request, res: Response) => {
        const room = await Room.create(req.body);
        res.status(201).json(success(room, 'Room created'));
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true },
        );
        if (!room) throw new AppError('Room not found', 404);
        res.json(success(room, 'Room updated'));
    });

    static remove = asyncHandler(async (req: Request, res: Response) => {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true },
        );
        if (!room) throw new AppError('Room not found', 404);
        res.json(success(room, 'Room deleted'));
    });
}
