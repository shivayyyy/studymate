import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentDocument extends Document {
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<ICommentDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
        content: { type: String, required: true, maxlength: 500 },
    },
    { timestamps: true },
);

CommentSchema.index({ postId: 1, createdAt: -1 });

export const Comment = mongoose.model<ICommentDocument>('Comment', CommentSchema);
