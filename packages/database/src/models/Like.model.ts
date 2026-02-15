import mongoose, { Schema, Document } from 'mongoose';

export interface ILikeDocument extends Document {
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LikeSchema = new Schema<ILikeDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    createdAt: { type: Date, default: Date.now },
});

LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
LikeSchema.index({ postId: 1, createdAt: -1 });

export const Like = mongoose.model<ILikeDocument>('Like', LikeSchema);
