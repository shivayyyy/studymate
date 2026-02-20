import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
    email: string;
    username: string;
    passwordHash?: string;
    fullName: string;
    profilePicture?: string;
    examCategory?: 'JEE' | 'NEET' | 'UPSC' | 'GATE';
    subjects: string[];
    targetYear?: number;
    googleId?: string;
    clerkId?: string;
    bio?: string;
    dailyStudyGoal: number; // in hours
    timerPreference: {
        mode: 'POMODORO' | 'EXTENDED' | 'DEEP' | 'CUSTOM';
        focusDuration: number;
        breakDuration: number;
    };
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
        passwordHash: { type: String, required: false }, // Optional for Google Auth users
        fullName: { type: String, required: true, trim: true },
        profilePicture: { type: String },
        examCategory: {
            type: String,
            enum: ['JEE', 'NEET', 'UPSC', 'GATE'],
            required: false, // Optional for Google Auth users initially
        },
        subjects: [{ type: String }],
        targetYear: { type: Number, required: false }, // Optional for Google Auth users initially
        bio: { type: String, maxlength: 200 },
        dailyStudyGoal: { type: Number, default: 4 },
        timerPreference: {
            mode: {
                type: String,
                enum: ['POMODORO', 'EXTENDED', 'DEEP', 'CUSTOM'],
                default: 'POMODORO',
            },
            focusDuration: { type: Number, default: 25 },
            breakDuration: { type: Number, default: 5 },
        },
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
        googleId: { type: String, unique: true, sparse: true },
        clerkId: { type: String, unique: true, sparse: true },
    },
    { timestamps: true },
);

// Indexes
// UserSchema.index({ email: 1 }); // Already indexed by unique: true
// UserSchema.index({ username: 1 }); // Already indexed by unique: true
// UserSchema.index({ googleId: 1 }, { unique: true, sparse: true }); // Already indexed by unique: true, sparse: true
UserSchema.index({ examCategory: 1, totalStudyHours: -1 }); // Leaderboard

export const User = mongoose.model<IUserDocument>('User', UserSchema);
