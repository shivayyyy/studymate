
import { create } from 'zustand';
import { FriendService } from '../services/friend.service';
import { FriendRequest, RelationshipStatus } from '@studymate/types';

interface FriendState {
    incomingRequests: FriendRequest[];
    outgoingRequests: FriendRequest[];
    friends: { _id: string; username: string; fullName: string; profilePicture?: string; followedAt: string }[];
    incomingCount: number;
    loading: boolean;
    error: string | null;

    fetchIncoming: () => Promise<void>;
    fetchOutgoing: () => Promise<void>;
    fetchFriends: () => Promise<void>;

    sendRequest: (userId: string) => Promise<void>;
    acceptRequest: (requestId: string) => Promise<void>;
    declineRequest: (requestId: string) => Promise<void>;
    cancelRequest: (requestId: string) => Promise<void>;
    unfriend: (userId: string) => Promise<void>;

    // Status caching could be implemented here or just use SWR/React Query in components. 
    // For now we expose a direct fetch helper without storing all statuses strictly to avoid staleness.
    getStatus: (userId: string) => Promise<RelationshipStatus>;
}

// Track last error time to prevent retry storms
let lastErrorTime = 0;
const ERROR_COOLDOWN_MS = 10000; // 10 second cooldown after errors

export const useFriendStore = create<FriendState>((set, get) => ({
    incomingRequests: [],
    outgoingRequests: [],
    friends: [],
    incomingCount: 0,
    loading: false,
    error: null,

    fetchIncoming: async () => {
        // Guard: skip if already loading or recently errored
        if (get().loading) return;
        if (Date.now() - lastErrorTime < ERROR_COOLDOWN_MS) return;

        set({ loading: true });
        try {
            const response = await FriendService.getIncomingRequests();
            set({
                incomingRequests: response.data,
                incomingCount: response.data.length,
                loading: false,
                error: null
            });
        } catch (error: any) {
            lastErrorTime = Date.now();
            set({ error: error.message, loading: false });
        }
    },

    fetchOutgoing: async () => {
        set({ loading: true });
        try {
            const response = await FriendService.getOutgoingRequests();
            set({ outgoingRequests: response.data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchFriends: async () => {
        set({ loading: true });
        try {
            const response = await FriendService.getFriends();
            set({ friends: response.data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    sendRequest: async (userId: string) => {
        set({ loading: true });
        try {
            const request = await FriendService.sendRequest(userId);
            set(state => ({
                outgoingRequests: [request, ...state.outgoingRequests],
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    acceptRequest: async (requestId: string) => {
        set({ loading: true });
        try {
            await FriendService.acceptRequest(requestId);
            // Remove from incoming
            set(state => ({
                incomingRequests: state.incomingRequests.filter(req => req._id !== requestId),
                incomingCount: Math.max(0, state.incomingCount - 1),
                loading: false
            }));
            // Refresh friends list if accepted
            get().fetchFriends();
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    declineRequest: async (requestId: string) => {
        set({ loading: true });
        try {
            await FriendService.declineRequest(requestId);
            set(state => ({
                incomingRequests: state.incomingRequests.filter(req => req._id !== requestId),
                incomingCount: Math.max(0, state.incomingCount - 1),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    cancelRequest: async (requestId: string) => {
        set({ loading: true });
        try {
            await FriendService.cancelRequest(requestId);
            set(state => ({
                outgoingRequests: state.outgoingRequests.filter(req => req._id !== requestId),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    unfriend: async (userId: string) => {
        set({ loading: true });
        try {
            await FriendService.unfriend(userId);
            set(state => ({
                friends: state.friends.filter(f => f._id !== userId),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    getStatus: async (userId: string) => {
        if (Date.now() - lastErrorTime < ERROR_COOLDOWN_MS) {
            return { status: 'none' as const };
        }
        try {
            return await FriendService.getStatus(userId);
        } catch (error) {
            lastErrorTime = Date.now();
            return { status: 'none' as const };
        }
    }
}));
