import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomDocument extends Document {
    name: string;
    description?: string;
    type: 'PUBLIC' | 'PRIVATE';
    password?: string;
    createdBy: mongoose.Types.ObjectId;
    examCategory: 'JEE' | 'NEET' | 'UPSC' | 'GATE';
    subject: string;
    timerMode: 'POMODORO_25_5' | 'EXTENDED_45_10' | 'LONG_90_20' | 'CUSTOM';
    customTimerConfig?: {
        focusMinutes: number;
        breakMinutes: number;
    };
    currentOccupancy: number;
    maxOccupancy: number;
    isActive: boolean;
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
        subject: { type: String, required: true },
        timerMode: {
            type: String,
            enum: ['POMODORO_25_5', 'EXTENDED_45_10', 'LONG_90_20', 'CUSTOM'],
            required: true,
        },
        customTimerConfig: {
            focusMinutes: { type: Number },
            breakMinutes: { type: Number },
        },
        currentOccupancy: { type: Number, default: 0 },
        maxOccupancy: { type: Number, default: 50 }, // Reduced default max
        isActive: { type: Boolean, default: true },
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

export const Room = mongoose.model<IRoomDocument>('Room', RoomSchema);
