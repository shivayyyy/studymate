import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
    recipientId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    type: 'LIKE_POST' | 'COMMENT_POST' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPT';
    postId?: mongoose.Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
    {
        recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['LIKE_POST', 'COMMENT_POST', 'FRIEND_REQUEST', 'FRIEND_ACCEPT'],
            required: true,
        },
        postId: { type: Schema.Types.ObjectId, ref: 'Post' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for getting user notifications quickly
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
// Index to prevent duplicate like notifications
NotificationSchema.index({ recipientId: 1, senderId: 1, type: 1, postId: 1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
