import mongoose, { Schema, Document } from 'mongoose';

export interface IPostDocument extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    contentType: 'NOTES' | 'MNEMONICS' | 'PYQ' | 'CHEAT_SHEET' | 'MIND_MAP' | 'MISTAKE_LOG';
    fileUrl?: string;
    thumbnailUrl?: string;
    examCategory: 'JEE' | 'NEET' | 'UPSC' | 'GATE';
    subject: string;
    tags: string[];
    likesCount: number;
    commentsCount: number;
    savesCount: number;
    sharesCount: number;
    engagementScore: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPostDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, maxlength: 1000 },
        contentType: {
            type: String,
            enum: ['NOTES', 'MNEMONICS', 'PYQ', 'CHEAT_SHEET', 'MIND_MAP', 'MISTAKE_LOG'],
            required: true,
        },
        fileUrl: { type: String },
        thumbnailUrl: { type: String },
        examCategory: {
            type: String,
            enum: ['JEE', 'NEET', 'UPSC', 'GATE'],
            required: true,
        },
        subject: { type: String, required: true },
        tags: [{ type: String, lowercase: true, trim: true }],
        likesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
        savesCount: { type: Number, default: 0 },
        sharesCount: { type: Number, default: 0 },
        engagementScore: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ examCategory: 1, subject: 1, engagementScore: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });

// Calculate engagement score before saving
PostSchema.pre('save', function (next) {
    this.engagementScore =
        this.likesCount * 1 + this.commentsCount * 3 + this.savesCount * 5;
    next();
});

export const Post = mongoose.model<IPostDocument>('Post', PostSchema);
