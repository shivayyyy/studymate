import mongoose, { Schema, Document } from 'mongoose';

export interface IPostDocument extends Document {
    userId: mongoose.Types.ObjectId;
    description?: string;
    fileUrl?: string; // Deprecated
    fileUrls?: string[]; // New
    thumbnailUrl?: string;
    authorName: string;
    authorUsername: string;
    authorProfilePicture?: string;
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
        description: { type: String, maxlength: 1000, required: true }, // Verified description is required if title is optional? logic check
        fileUrl: { type: String }, // Deprecated but kept for compat
        fileUrls: [{ type: String }], // New array support
        thumbnailUrl: { type: String },
        authorName: { type: String, required: true },
        authorUsername: { type: String, required: true },
        authorProfilePicture: { type: String },
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
    if (this.isModified('likesCount') || this.isModified('commentsCount') || this.isModified('savesCount')) {
        this.engagementScore =
            (this.likesCount || 0) * 1 + (this.commentsCount || 0) * 3 + (this.savesCount || 0) * 5;
    }
    next();
});

export const Post = mongoose.model<IPostDocument>('Post', PostSchema);
