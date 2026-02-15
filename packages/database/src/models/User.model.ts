import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
    email: string;
    username: string;
    passwordHash: string;
    fullName: string;
    profilePicture?: string;
    examCategory: 'JEE' | 'NEET' | 'UPSC' | 'GATE';
    subjects: string[];
    targetYear: number;
    bio?: string;
    totalStudyHours: number;
    currentStreak: number;
    longestStreak: number;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    contributorBadge?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        username: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        fullName: { type: String, required: true, trim: true },
        profilePicture: { type: String },
        examCategory: {
            type: String,
            enum: ['JEE', 'NEET', 'UPSC', 'GATE'],
            required: true,
        },
        subjects: [{ type: String }],
        targetYear: { type: Number, required: true },
        bio: { type: String, maxlength: 200 },
        totalStudyHours: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        postsCount: { type: Number, default: 0 },
        contributorBadge: {
            type: String,
            enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
        },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ examCategory: 1, totalStudyHours: -1 }); // Leaderboard

export const User = mongoose.model<IUserDocument>('User', UserSchema);
