import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowDocument extends Document {
    followerId: mongoose.Types.ObjectId;
    followingId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const FollowSchema = new Schema<IFollowDocument>({
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1, createdAt: -1 });
FollowSchema.index({ followerId: 1, createdAt: -1 });

export const Follow = mongoose.model<IFollowDocument>('Follow', FollowSchema);
