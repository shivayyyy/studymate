import { api } from '../lib/axios';

export interface LeaderboardEntry {
    userId: string;
    score: number;
    user: {
        _id: string;
        fullName: string;
        username: string;
        profilePicture?: string;
    };
}

export const AnalyticsService = {
    getLeaderboard: async (examCategory: string = 'JEE', limit: number = 10) => {
        const { data } = await api.get<{ success: boolean; data: LeaderboardEntry[] }>('/analytics/leaderboard', {
            params: { examCategory, limit }
        });
        return data;
    },

    getUserStats: async () => {
        const { data } = await api.get('/analytics/stats');
        return data;
    }
};
