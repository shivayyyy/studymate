import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomMessageDocument extends Document {
    roomId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    username: string; // Denormalized for quick display
    content: string;
    timestamp: Date;
}

const RoomMessageSchema = new Schema<IRoomMessageDocument>(
    {
        roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        username: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    {
        timestamps: false, // We use our own timestamp field
    }
);

// Indexes for fast retrieval
RoomMessageSchema.index({ roomId: 1, timestamp: -1 });

export const RoomMessage = mongoose.model<IRoomMessageDocument>('RoomMessage', RoomMessageSchema);
