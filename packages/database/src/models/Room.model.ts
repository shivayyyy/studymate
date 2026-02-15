import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomDocument extends Document {
    name: string;
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
        name: { type: String, required: true },
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
        maxOccupancy: { type: Number, default: 500 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

RoomSchema.index({ examCategory: 1, subject: 1 });
RoomSchema.index({ isActive: 1, currentOccupancy: -1 });

export const Room = mongoose.model<IRoomDocument>('Room', RoomSchema);
