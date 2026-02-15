import { ContentType, ExamCategory } from '../enums';

export interface IPost {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    contentType: ContentType;
    fileUrl?: string;
    thumbnailUrl?: string;
    examCategory: ExamCategory;
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

export interface IPostCreate {
    title: string;
    description?: string;
    contentType: ContentType;
    examCategory: ExamCategory;
    subject: string;
    tags?: string[];
}

export interface IPostUpdate {
    title?: string;
    description?: string;
    tags?: string[];
}

export interface ILike {
    _id: string;
    userId: string;
    postId: string;
    createdAt: Date;
}

export interface IComment {
    _id: string;
    userId: string;
    postId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISave {
    _id: string;
    userId: string;
    postId: string;
    createdAt: Date;
}

export interface IFollow {
    _id: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
}
