
import { api } from '@/lib/axios';
import { FriendRequest, RelationshipStatus } from '@studymate/types';

interface RequestsResponse {
    data: FriendRequest[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface FriendsResponse {
    data: {
        _id: string;
        username: string;
        fullName: string;
        profilePicture?: string;
        followedAt: string
    }[];
    meta: {
        page: number;
        limit: number;
        total: number; // Note: controller didn't fully implement total yet, but let's keep interface consistent
        totalPages: number;
    };
}

export const FriendService = {
    sendRequest: async (userId: string) => {
        const response = await api.post(`/friends/request/${userId}`);
        return response.data.data as FriendRequest;
    },

    acceptRequest: async (requestId: string) => {
        const response = await api.post(`/friends/accept/${requestId}`);
        return response.data.data;
    },

    declineRequest: async (requestId: string) => {
        const response = await api.post(`/friends/decline/${requestId}`);
        return response.data.data;
    },

    cancelRequest: async (requestId: string) => {
        const response = await api.delete(`/friends/cancel/${requestId}`);
        return response.data.data;
    },

    getIncomingRequests: async (page = 1, limit = 10) => {
        const response = await api.get<RequestsResponse>(`/friends/requests/incoming?page=${page}&limit=${limit}`);
        return response.data; // contains data and meta
    },

    getOutgoingRequests: async (page = 1, limit = 10) => {
        const response = await api.get<RequestsResponse>(`/friends/requests/outgoing?page=${page}&limit=${limit}`);
        return response.data;
    },

    getStatus: async (userId: string) => {
        const response = await api.get<{ data: RelationshipStatus }>(`/friends/status/${userId}`);
        return response.data.data;
    },

    unfriend: async (userId: string) => {
        const response = await api.delete(`/friends/${userId}`);
        return response.data.data;
    },

    getFriends: async (page = 1, limit = 10) => {
        const response = await api.get<FriendsResponse>(`/friends?page=${page}&limit=${limit}`);
        return response.data;
    }
};
