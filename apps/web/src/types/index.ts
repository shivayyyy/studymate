export interface User {
    _id: string;
    username: string;
    fullName: string;
    profilePicture?: string;
    isVerified?: boolean;
}

export interface Post {
    _id: string;
    description: string; // Made required as per logic
    userId: User | string; // Can be ID or populated object
    title?: string;
    contentType: 'NOTES' | 'MNEMONICS' | 'PYQ' | 'CHEAT_SHEET' | 'MIND_MAP' | 'MISTAKE_LOG';
    authorName?: string;
    authorUsername?: string;
    authorProfilePicture?: string;
    fileUrl?: string;
    fileUrls?: string[];
    thumbnailUrl?: string;
    likesCount: number;
    commentsCount: number;
    savesCount: number;
    sharesCount?: number; // Optional in model but good to have
    examCategory: string;
    subject: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    isLiked?: boolean;
    isSaved?: boolean;
}

export interface FeedResponse {
    success: boolean;
    message: string;
    data: Post[];
    meta?: {
        nextCursor?: number;
    };
}
