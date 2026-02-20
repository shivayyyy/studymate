
import { create } from 'zustand';
import { socketClient } from '@/lib/socket';
import { ChatService, Conversation, Message } from '@/services/chat.service';

interface ChatState {
    socket: any;
    conversations: Conversation[];
    messages: Record<string, Message[]>; // conversationId -> messages
    activeConversationId: string | null;
    typingUsers: Record<string, string[]>; // conversationId -> userIds
    onlineUsers: Set<string>;
    isLoading: boolean;
    error: string | null;

    initialize: (token: string) => void;
    disconnect: () => void;

    fetchConversations: () => Promise<void>;
    setActiveConversation: (id: string | null) => void;

    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>;

    // Socket events
    handleReceiveMessage: (msg: Message) => void;
    handleMessageRead: (payload: { conversationId: string, messageIds: string[], readBy: string, at: Date }) => void;
    handleTyping: (payload: { conversationId: string, userId: string }) => void;
    setTyping: (conversationId: string, isTyping: boolean) => void;
    isUserOnline: (userId: string) => boolean;

    // Actions
    markMessagesAsRead: (conversationId: string, messageIds: string[], currentUserId: string) => void;
}

// Typing indicator timeout map (outside store to avoid re-renders)
const typingTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};

export const useChatStore = create<ChatState>((set, get) => ({
    socket: null,
    conversations: [],
    messages: {},
    activeConversationId: null,
    typingUsers: {},
    onlineUsers: new Set(),
    isLoading: false,
    error: null,

    initialize: (token: string) => {
        const socket = socketClient.connect(token);
        set({ socket });

        // Remove existing listeners to avoid duplicates if re-initializing
        socket.off('new_message');
        socket.off('typing');
        socket.off('connect');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('online_users_list');

        // --- Message Events ---
        socket.on('new_message', (msg: Message) => {
            get().handleReceiveMessage(msg);
        });

        socket.on('message_read', (payload: any) => {
            get().handleMessageRead(payload);
        });



        socket.on('typing', (payload: any) => {
            get().handleTyping(payload);
        });

        // --- Presence Events ---
        socket.on('user_online', ({ userId }: { userId: string }) => {
            set(state => {
                const newSet = new Set(state.onlineUsers);
                newSet.add(userId);
                return { onlineUsers: newSet };
            });
        });

        socket.on('user_offline', ({ userId }: { userId: string }) => {
            set(state => {
                const newSet = new Set(state.onlineUsers);
                newSet.delete(userId);
                return { onlineUsers: newSet };
            });
        });

        socket.on('online_users_list', (userIds: string[]) => {
            set({ onlineUsers: new Set(userIds) });
        });

        // Request current online users list on connect
        socket.on('connect', () => {
            socket.emit('get_online_users');
        });

        // If already connected, request immediately
        if (socket.connected) {
            socket.emit('get_online_users');
        }
    },

    disconnect: () => {
        socketClient.disconnect();
        set({ socket: null, onlineUsers: new Set(), typingUsers: {} });
    },

    fetchConversations: async () => {
        set({ isLoading: true });
        try {
            const res = await ChatService.getConversations();
            if (res.success) {
                set({ conversations: res.data, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    setActiveConversation: (id: string | null) => {
        set({ activeConversationId: id });
        if (id) {
            // Join real-time room
            const socket = get().socket;
            if (socket) {
                socket.emit('join_conversation', id);
            }
            get().fetchMessages(id);
        }
    },

    fetchMessages: async (conversationId: string) => {
        try {
            const res = await ChatService.getConversationMessages(conversationId);
            if (res.success) {
                set(state => ({
                    messages: {
                        ...state.messages,
                        [conversationId]: res.data.reverse()
                    }
                }));
            }
        } catch (error: any) {
            console.error('Failed to fetch messages', error);
        }
    },

    sendMessage: async (content: string, type = 'text') => {
        const { activeConversationId, conversations } = get();
        if (!activeConversationId) return;

        try {
            const res = await ChatService.sendConversationMessage(activeConversationId, content, type);
            if (res.success) {
                const msg = res.data;
                // Backend uses socket.to(room) which EXCLUDES sender.
                // So we MUST append locally.
                get().handleReceiveMessage(msg);

                // Update conversation list 'lastMessage'
                const updatedConversations = conversations.map(c => {
                    if (c._id === activeConversationId) {
                        return { ...c, lastMessage: msg, updatedAt: msg.createdAt };
                    }
                    return c;
                }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

                set({ conversations: updatedConversations });
            }
        } catch (error: any) {
            console.error('Failed to send message', error);
            set({ error: error.message });
        }
    },

    handleReceiveMessage: (msg: Message) => {
        const { activeConversationId } = get();

        // 1. Add to messages map
        set(state => {
            const currentMessages = state.messages[msg.conversationId!] || [];
            // Dedup check
            if (currentMessages.some(m => m._id === msg._id)) return {};

            return {
                messages: {
                    ...state.messages,
                    [msg.conversationId!]: [...currentMessages, msg]
                }
            };
        });

        // 2. Update conversation preview
        set(state => {
            const convIndex = state.conversations.findIndex(c => c._id === msg.conversationId);
            let newConversations = [...state.conversations];

            if (convIndex !== -1) {
                const conv = newConversations[convIndex];
                newConversations.splice(convIndex, 1);
                newConversations.unshift({
                    ...conv,
                    lastMessage: msg,
                    updatedAt: msg.createdAt,
                    unreadCount: (activeConversationId === msg.conversationId) ? 0 : (conv.unreadCount + 1)
                });
            } else {
                get().fetchConversations();
            }
            return { conversations: newConversations };
        });

        // 3. Clear typing indicator for this user (they sent a message, so they stopped typing)
        if (msg.senderId && msg.conversationId) {
            const senderId = typeof msg.senderId === 'string' ? msg.senderId : (msg.senderId as any)?._id;
            if (senderId) {
                set(state => {
                    const convTyping = state.typingUsers[msg.conversationId!] || [];
                    return {
                        typingUsers: {
                            ...state.typingUsers,
                            [msg.conversationId!]: convTyping.filter(id => id !== senderId)
                        }
                    };
                });
            }
        }
    },

    handleMessageRead: (payload: { conversationId: string, messageIds: string[], readBy: string, at: Date }) => {
        const { conversationId, messageIds, readBy } = payload;

        set(state => {
            const currentMessages = state.messages[conversationId] || [];
            let updated = false;

            const newMessages = currentMessages.map(msg => {
                if (messageIds.includes(msg._id!) && !(msg.readBy || []).includes(readBy)) {
                    updated = true;
                    return { ...msg, readBy: [...(msg.readBy || []), readBy] };
                }
                return msg;
            });

            if (!updated) return {};

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: newMessages
                }
            };
        });
    },

    markMessagesAsRead: (conversationId: string, messageIds: string[], currentUserId: string) => {
        if (!messageIds.length) return;
        const socket = get().socket;

        // 1. Emit to server
        if (socket) {
            socket.emit('mark_read', { conversationId, messageIds });
        }

        // 2. Optimistic local update — mark readBy on messages AND reset unreadCount.
        //    The server uses socket.to() which excludes the sender, so we will NOT
        //    receive a message_read event back. We MUST update readBy locally to
        //    prevent the useEffect from re-firing (infinite loop).
        set(state => {
            const currentMessages = state.messages[conversationId] || [];
            const newMessages = currentMessages.map(msg => {
                if (messageIds.includes(msg._id!) && !(msg.readBy || []).includes(currentUserId)) {
                    return { ...msg, readBy: [...(msg.readBy || []), currentUserId] };
                }
                return msg;
            });

            const newConversations = state.conversations.map(c => {
                if (c._id === conversationId) {
                    return { ...c, unreadCount: 0 };
                }
                return c;
            });

            return {
                messages: { ...state.messages, [conversationId]: newMessages },
                conversations: newConversations
            };
        });
    },



    handleTyping: (payload: { conversationId: string, userId: string }) => {
        const { conversationId, userId } = payload;
        const timeoutKey = `${conversationId}:${userId}`;

        // Add user to typing list
        set(state => {
            const current = state.typingUsers[conversationId] || [];
            if (current.includes(userId)) return {};
            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: [...current, userId]
                }
            };
        });

        // Clear previous timeout for this user
        if (typingTimeouts[timeoutKey]) {
            clearTimeout(typingTimeouts[timeoutKey]);
        }

        // Auto-remove after 3 seconds of no typing events
        typingTimeouts[timeoutKey] = setTimeout(() => {
            set(state => {
                const current = state.typingUsers[conversationId] || [];
                return {
                    typingUsers: {
                        ...state.typingUsers,
                        [conversationId]: current.filter(id => id !== userId)
                    }
                };
            });
            delete typingTimeouts[timeoutKey];
        }, 3000);
    },

    setTyping: (conversationId, isTyping) => {
        const socket = get().socket;
        if (socket) {
            socket.emit('typing', { conversationId, isTyping });
        }
    },

    isUserOnline: (userId: string) => {
        return get().onlineUsers.has(userId);
    }
}));
