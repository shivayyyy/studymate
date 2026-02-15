import { ExamCategory, ContributorBadge } from '../enums';

export interface IUser {
    _id: string;
    email: string;
    username: string;
    passwordHash: string;
    fullName: string;
    profilePicture?: string;
    examCategory: ExamCategory;
    subjects: string[];
    targetYear: number;
    bio?: string;

    // Stats
    totalStudyHours: number;
    currentStreak: number;
    longestStreak: number;

    // Social
    followersCount: number;
    followingCount: number;
    postsCount: number;

    // Reputation
    contributorBadge?: ContributorBadge;

    isVerified: boolean;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export type IUserPublic = Omit<IUser, 'passwordHash'>;

export interface IUserCreate {
    email: string;
    username: string;
    password: string;
    fullName: string;
    examCategory: ExamCategory;
    subjects: string[];
    targetYear: number;
    bio?: string;
}

export interface IUserUpdate {
    fullName?: string;
    profilePicture?: string;
    examCategory?: ExamCategory;
    subjects?: string[];
    targetYear?: number;
    bio?: string;
}
