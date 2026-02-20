import { Request, Response } from 'express';
import { Room } from '@studymate/database';
import { asyncHandler } from '@studymate/utils';
import { success, error } from '@studymate/utils';
import bcrypt from 'bcryptjs';

export class RoomController {

    // Create a new room
    static createRoom = asyncHandler(async (req: Request, res: Response) => {
        const { name, description, type, password, examCategory, subject, timerMode, customTimerConfig } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json(error('Unauthorized', 401));
            return;
        }

        // Validate Private Room Password
        if (type === 'PRIVATE' && !password) {
            res.status(400).json(error('Password is required for private rooms', 400));
            return;
        }

        let hashedPassword;
        if (type === 'PRIVATE' && password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const room = await Room.create({
            name,
            description,
            type,
            password: hashedPassword,
            createdBy: userId,
            examCategory,
            subject,
            timerMode,
            customTimerConfig,
            currentOccupancy: 0, // Initially 0, or 1 if creator auto-joins
            maxOccupancy: 50
        });

        // Hide password in response
        const roomData = room.toObject();
        delete roomData.password;

        res.status(201).json(success(roomData, 'Room created successfully'));
    });

    // Get all rooms (with filters)
    static getRooms = asyncHandler(async (req: Request, res: Response) => {
        const { type, examCategory, search } = req.query;

        const query: any = { isActive: true };
        const sort: any = { currentOccupancy: -1, createdAt: -1 }; // Default sort

        if (type && ['PUBLIC', 'PRIVATE'].includes(type as string)) {
            query.type = type;
        }
        if (examCategory && examCategory !== 'ALL') {
            query.examCategory = examCategory;
        }

        if (search) {
            query.$text = { $search: search as string };
            // Sort by relevance score if searching
            sort.score = { $meta: 'textScore' };
        }

        // Setup pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const rooms = await Room.find(query, search ? { score: { $meta: 'textScore' } } : {})
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'username fullName profilePicture'); // Show creator info

        const total = await Room.countDocuments(query);

        res.json(success(rooms, 'Rooms fetched successfully', {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }));
    });

    // Get single room details
    static getRoomById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const room = await Room.findById(id).populate('createdBy', 'username fullName profilePicture');

        if (!room) {
            res.status(404).json(error('Room not found', 404));
            return;
        }

        res.json(success(room, 'Room details fetched'));
    });

    // Join Room (Verify Password for Private)
    static joinRoom = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { password } = req.body;

        const room = await Room.findById(id).select('+password');

        if (!room) {
            res.status(404).json(error('Room not found', 404));
            return;
        }

        if (room.type === 'PRIVATE') {
            if (!password) {
                res.status(400).json(error('Password required for private room', 400));
                return;
            }

            const isMatch = await bcrypt.compare(password, room.password || '');
            if (!isMatch) {
                res.status(401).json(error('Incorrect password', 401));
                return;
            }
        }

        // Logic to add user to room participant list (if we had one) or update occupancy
        // For now, we just return success allowing frontend to connect via socket or enter

        // Return room info but WITHOUT password
        const roomData = room.toObject();
        delete roomData.password;

        res.json(success(roomData, 'Joined room successfully'));
    });
}
