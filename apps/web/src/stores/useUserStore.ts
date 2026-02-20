import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '../lib/axios';

export interface User {
    _id: string;
    email: string;
    fullName: string;
    username: string;
    profilePicture?: string;
    examCategory?: string;
    subjects?: string[];
    targetYear?: number;
    dailyStudyGoal?: number;
    bio?: string;
    timerPreference?: {
        mode: string;
        focusDuration: number;
        breakDuration: number;
    };
    isVerified: boolean;
    isActive: boolean;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            login: (user) => {
                set({ user, isAuthenticated: true, isLoading: false });
            },

            logout: () => {
                set({ user: null, isAuthenticated: false, isLoading: false });
            },

            updateUser: (userUpdates) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...userUpdates } });
                }
            },

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const response = await api.get('/auth/me');
                    set({
                        user: response.data.data,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
