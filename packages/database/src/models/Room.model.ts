import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomDocument extends Document {
    name: string;
    description?: string;
    type: 'PUBLIC' | 'PRIVATE';
    password?: string;
    createdBy: mongoose.Types.ObjectId;
    examCategory: 'JEE' | 'NEET' | 'UPSC' | 'GATE';
    category: 'STUDY' | 'QUIZ';
    subject: string;
    currentOccupancy: number;
    maxOccupancy: number;
    isActive: boolean;
    ownerId: mongoose.Types.ObjectId | null;
    isOwnerless: boolean;
    settings: {
        focusModeEnabled: boolean;
        chatEnabled: boolean;
        audioEnabled: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema = new Schema<IRoomDocument>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        type: {
            type: String,
            enum: ['PUBLIC', 'PRIVATE'],
            default: 'PUBLIC',
            required: true
        },
        password: { type: String, select: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        examCategory: {
            type: String,
            enum: ['JEE', 'NEET', 'UPSC', 'GATE'],
            required: true,
        },
        category: {
            type: String,
            enum: ['STUDY', 'QUIZ'],
            default: 'STUDY',
            required: true,
        },
        subject: { type: String, required: true },
        currentOccupancy: { type: Number, default: 0 },
        maxOccupancy: { type: Number, default: 50 }, // Reduced default max
        isActive: { type: Boolean, default: true },
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        isOwnerless: { type: Boolean, default: false },
        settings: {
            focusModeEnabled: { type: Boolean, default: false },
            chatEnabled: { type: Boolean, default: true },
            audioEnabled: { type: Boolean, default: true },
        }
    },
    {
        timestamps: true
    },
);

// Fix for StrictPopulateError
RoomSchema.set('strictPopulate' as any, false);

// Text index for search
RoomSchema.index({ name: 'text', subject: 'text', examCategory: 'text' });
RoomSchema.index({ examCategory: 1, subject: 1 });
RoomSchema.index({ isActive: 1, type: 1 });
RoomSchema.index({ createdBy: 1 });
RoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 21600 }); // 6 hours

export const Room = mongoose.model<IRoomDocument>('Room', RoomSchema);
