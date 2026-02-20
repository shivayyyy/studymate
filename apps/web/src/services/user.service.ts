import { api } from '../lib/axios';
import { User } from '../stores/useUserStore';

export const UserService = {
    searchUsers: async (query: string, examCategory?: string) => {
        const { data } = await api.get<{ success: boolean; data: User[] }>('/users/search', {
            params: { q: query, examCategory, limit: 12 }
        });
        return data;
    },

    getUser: async (userId: string) => {
        const { data } = await api.get<{ success: boolean; data: User }>(`/users/${userId}`);
        return data;
    }
};
