import { api } from '../lib/axios';
import { FeedResponse, Post } from '../types';

export const FeedService = {
    getFeed: async (params: {
        type: 'latest' | 'trending' | 'subject' | 'tag';
        examCategory: string;
        subject?: string;
        tag?: string;
        cursor?: number;
        limit?: number;
    }) => {
        const { data } = await api.get<FeedResponse>('/posts', { params });
        return data;
    },

    createPost: async (postData: Partial<Post>) => {
        const { data } = await api.post<{ success: boolean; data: Post }>('/posts', postData);
        return data;
    },

    deletePost: async (postId: string) => {
        const { data } = await api.delete(`/posts/${postId}`);
        return data;
    },

    likePost: async (postId: string) => {
        const { data } = await api.post(`/posts/${postId}/like`);
        return data;
    },

    unlikePost: async (postId: string) => {
        const { data } = await api.delete(`/posts/${postId}/like`);
        return data;
    },

    savePost: async (postId: string) => {
        const { data } = await api.post(`/posts/${postId}/save`);
        return data;
    },

    unsavePost: async (postId: string) => {
        const { data } = await api.delete(`/posts/${postId}/save`);
        return data;
    }
};
