import { Request, Response } from 'express';
import { Room } from '@studymate/database';
import { RoomCache } from '@studymate/cache';
import { asyncHandler } from '@studymate/utils';
import { success, error } from '@studymate/utils';
import bcrypt from 'bcryptjs';

export class RoomController {

    // Create a new room
    static createRoom = asyncHandler(async (req: Request, res: Response) => {
        const { name, description, type, category, password, examCategory, subject } = req.body;
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
            category: category || 'STUDY',
            password: hashedPassword,
            createdBy: userId,
            ownerId: userId, // Set creator as initial owner
            examCategory,
            subject,
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
        const { type, category, examCategory, search } = req.query;

        const query: any = { isActive: true };
        const sort: any = { currentOccupancy: -1, createdAt: -1 }; // Default sort

        if (type && ['PUBLIC', 'PRIVATE'].includes(type as string)) {
            query.type = type;
        }
        if (category && ['STUDY', 'QUIZ'].includes(category as string)) {
            query.category = category;
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

        // Enrich rooms with live occupancy from Redis
        const enrichedRooms = await Promise.all(
            rooms.map(async (room) => {
                const roomObj = room.toObject();
                try {
                    const liveUsers = await RoomCache.getRoomUsers(room._id.toString());
                    roomObj.currentOccupancy = liveUsers.length;
                } catch {
                    // Fallback to DB value if Redis fails
                }
                return roomObj;
            })
        );

        res.json(success(enrichedRooms, 'Rooms fetched successfully', {
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

    // Transfer Room Ownership
    static transferOwnership = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { newOwnerId } = req.body;
        const currentUserId = req.user?.userId;

        const room = await Room.findById(id);

        if (!room) {
            res.status(404).json(error('Room not found', 404));
            return;
        }

        // Only current owner can transfer ownership
        if (room.ownerId?.toString() !== currentUserId) {
            res.status(403).json(error('Only the room owner can transfer ownership', 403));
            return;
        }

        room.ownerId = newOwnerId;
        room.isOwnerless = false;
        await room.save();

        res.json(success(room, 'Ownership transferred successfully'));
    });

    // Delete Room
    static deleteRoom = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user?.userId;

        const room = await Room.findById(id);

        if (!room) {
            res.status(404).json(error('Room not found', 404));
            return;
        }

        // Only owner can delete room
        if (room.ownerId?.toString() !== userId) {
            res.status(403).json(error('Only the room owner can delete the room', 403));
            return;
        }

        room.isActive = false;
        await room.deleteOne();

        res.json(success(null, 'Room deleted successfully'));
    });
}
