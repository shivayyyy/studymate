import { create } from 'zustand';
import { api } from '../lib/axios';

export interface INotification {
    _id: string;
    recipientId: string;
    senderId: {
        _id: string;
        username: string;
        fullName: string;
        profilePicture?: string;
    };
    type: 'LIKE_POST' | 'COMMENT_POST' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPT';
    postId?: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: INotification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;

    fetchNotifications: () => Promise<void>;
    markAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
            const response = await api.get('/notifications');
            const notifications = response.data;
            const unreadCount = notifications.filter((n: INotification) => !n.isRead).length;

            set({
                notifications,
                unreadCount,
                loading: false,
                error: null
            });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    markAsRead: async () => {
        try {
            await api.post('/notifications/mark-read');
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (error: any) {
            console.error('Failed to mark notifications as read:', error);
        }
    }
}));
