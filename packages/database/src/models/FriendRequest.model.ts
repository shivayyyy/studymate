import mongoose, { Schema, Document, Types } from 'mongoose';

export enum FriendRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    CANCELLED = 'cancelled',
}

export interface IFriendRequestDocument extends Document {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    status: FriendRequestStatus;
    createdAt: Date;
    updatedAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequestDocument>(
    {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: Object.values(FriendRequestStatus),
            default: FriendRequestStatus.PENDING,
        },
    },
    { timestamps: true }
);

// Ensure one active request per pair
FriendRequestSchema.index({ senderId: 1, receiverId: 1, status: 1 });
// Quick lookup for a user's incoming requests
FriendRequestSchema.index({ receiverId: 1, status: 1, createdAt: -1 });
// Quick lookup for a user's outgoing requests
FriendRequestSchema.index({ senderId: 1, status: 1, createdAt: -1 });

export const FriendRequest = mongoose.model<IFriendRequestDocument>('FriendRequest', FriendRequestSchema);
