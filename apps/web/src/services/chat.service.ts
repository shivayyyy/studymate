
import { chatApi } from '@/lib/axios';
import { IUser } from '@studymate/types';

// Define interfaces if not available in shared types yet
export interface Message {
    _id: string;
    conversationId?: string;
    roomId?: string;
    senderId: IUser | string;
    text: string;
    messageType: 'text' | 'image' | 'file';
    readBy: string[];
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: IUser[];
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
    // For DMs, we might want a helper to get the "other" user
}

export const ChatService = {
    // Get all DM conversations
    getConversations: async () => {
        const response = await chatApi.get('/conversations');
        return response.data;
    },

    // Start or get existing conversation with a user
    startConversation: async (userId: string) => {
        const response = await chatApi.post('/conversations', { participantId: userId });
        return response.data;
    },

    // Get messages for a specific conversation (DM)
    getConversationMessages: async (conversationId: string, page = 1, limit = 50) => {
        const response = await chatApi.get(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Send message to a conversation (DM)
    sendConversationMessage: async (conversationId: string, content: string, type = 'text') => {
        const response = await chatApi.post(`/conversations/${conversationId}/messages`, { text: content, type });
        return response.data;
    },

    // Get messages for a study room (Group)
    getRoomMessages: async (roomId: string, page = 1, limit = 50) => {
        const response = await chatApi.get(`/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Send message to a study room (Group)
    sendRoomMessage: async (roomId: string, content: string, type = 'text') => {
        const response = await chatApi.post(`/rooms/${roomId}/messages`, { text: content, type });
        return response.data;
    }
};
