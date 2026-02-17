import mongoose, { Schema, Document, Types } from 'mongoose';

export enum MessageStatus {
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
}

export interface IMessageDocument extends Document {
    conversationId?: Types.ObjectId;
    roomId?: Types.ObjectId;
    senderId: Types.ObjectId;
    text: string;
    messageType: MessageType;
    mediaUrl?: string;
    status: MessageStatus;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
        roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        messageType: { type: String, enum: Object.values(MessageType), default: MessageType.TEXT },
        mediaUrl: { type: String },
        status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.SENT },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

export const Message = mongoose.model<IMessageDocument>('Message', MessageSchema);
