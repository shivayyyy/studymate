import mongoose, { Schema, Document } from 'mongoose';

export interface ISaveDocument extends Document {
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const SaveSchema = new Schema<ISaveDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    createdAt: { type: Date, default: Date.now },
});

SaveSchema.index({ userId: 1, postId: 1 }, { unique: true });
SaveSchema.index({ userId: 1, createdAt: -1 });

export const Save = mongoose.model<ISaveDocument>('Save', SaveSchema);
