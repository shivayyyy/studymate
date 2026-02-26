import { create } from 'zustand';
import { socketClient } from '@/lib/socket';
import { api } from '@/lib/axios';
import { RoomUser, ChatMessage } from '@studymate/types/src/websocket';
import { PresenceStatus } from '@studymate/types';

interface RoomStoreState {
    // Connection
    roomId: string | null;
    isJoined: boolean;
    isLoading: boolean;
    error: string | null;

    // Room metadata
    roomName: string;
    roomType: 'PUBLIC' | 'PRIVATE';
    roomCategory: 'STUDY' | 'QUIZ';
    examCategory: string;
    subject: string;

    // Users
    users: RoomUser[];
    ownerId: string | null;
    isOwnerless: boolean;

    // Chat
    messages: ChatMessage[];
    typingUsers: string[];

    // Audio / Focus logic
    isAudioEnabled: boolean;
    isMuted: boolean;
    audioAvailable: boolean;
    isFocusMode: boolean;

    // Per-user mic time restriction
    isPersonalFocusMode: boolean;
    micTimeUsedMs: number;
    micTimeLimitMs: number | null;
    micTimeWarning: string | null;

    // Actions
    joinRoom: (roomId: string, password?: string) => Promise<void>;
    leaveRoom: () => void;
    sendChatMessage: (content: string) => void;
    setTyping: (isTyping: boolean) => void;
    toggleMute: () => void;
    toggleFocusMode: () => void;
    transferOwnership: (toUserId: string) => void;
    deleteRoom: () => Promise<void>;
    dismissMicWarning: () => void;

    // Internal Handlers
    handleRoomJoined: (state: any) => void;
}

export const useRoomStore = create<RoomStoreState>((set, get) => ({
    roomId: null,
    isJoined: false,
    isLoading: false,
    error: null,
    roomName: '',
    roomType: 'PUBLIC',
    roomCategory: 'STUDY',
    examCategory: '',
    subject: '',
    users: [],
    ownerId: null,
    isOwnerless: false,
    messages: [],
    typingUsers: [],
    isAudioEnabled: false,
    isMuted: true,
    audioAvailable: true,
    isFocusMode: false,
    isPersonalFocusMode: false,
    micTimeUsedMs: 0,
    micTimeLimitMs: 300000, // 5 minutes fixed
    micTimeWarning: null,

    joinRoom: async (roomId: string, password?: string) => {
        set({ isLoading: true, error: null });
        try {
            // Phase 1: REST verification (required mainly for PRIVATE rooms to verify password)
            const res = await api.post(`/rooms/${roomId}/join`, { password });

            if (res.data.success) {
                const roomData = res.data.data;

                set({
                    roomId,
                    roomName: roomData.name,
                    roomType: roomData.type,
                    roomCategory: roomData.category || 'STUDY',
                    examCategory: roomData.examCategory,
                    subject: roomData.subject,
                    ownerId: roomData.ownerId,
                    isOwnerless: roomData.isOwnerless,
                    isFocusMode: roomData.settings?.focusModeEnabled || false,
                    audioAvailable: !(roomData.settings?.focusModeEnabled || false)
                });

                // Phase 2: WebSocket Join
                const socket = socketClient.getSocket();
                if (socket) {
                    // Set up local listeners BEFORE emitting join
                    socket.off('room:joined');
                    socket.off('room:user-joined');
                    socket.off('room:user-left');
                    socket.off('chat:message');
                    socket.off('chat:typing');
                    socket.off('room:focus-mode-changed');
                    socket.off('room:owner-changed');
                    socket.off('room:user-kicked');
                    socket.off('audio:user-muted');
                    socket.off('timer:sync');
                    socket.off('room:personal-focus-mode');
                    socket.off('mic:time-update');
                    socket.off('timer:reset');

                    socket.on('room:joined', (payload: any) => get().handleRoomJoined(payload));

                    socket.on('room:user-joined', ({ userId, username }) => {
                        set(state => {
                            if (state.users.some(u => u.userId === userId)) return state;
                            return {
                                users: [...state.users, {
                                    userId, username, presence: PresenceStatus.ONLINE, joinedAt: Date.now(),
                                    isOwner: state.ownerId === userId, isMuted: true, audioEnabled: false
                                }]
                            };
                        });
                    });

                    socket.on('room:user-left', ({ userId }) => {
                        set(state => ({
                            users: state.users.filter(u => u.userId !== userId)
                        }));
                    });

                    socket.on('chat:message', (message: ChatMessage) => {
                        set(state => ({ messages: [...state.messages, message] }));
                    });

                    socket.on('chat:typing', ({ username, isTyping }) => {
                        set(state => {
                            const current = state.typingUsers;
                            if (isTyping && !current.includes(username)) return { typingUsers: [...current, username] };
                            if (!isTyping) return { typingUsers: current.filter(u => u !== username) };
                            return {};
                        });
                    });

                    socket.on('room:focus-mode-changed', ({ enabled }) => {
                        set({
                            isFocusMode: enabled,
                            audioAvailable: !enabled,
                            isMuted: enabled ? true : get().isMuted
                        });
                    });

                    socket.on('room:owner-changed', ({ newOwnerId }) => {
                        set({ ownerId: newOwnerId, isOwnerless: false });
                    });

                    socket.on('audio:user-muted', ({ userId, isMuted }) => {
                        set(state => ({
                            users: state.users.map(u => u.userId === userId ? { ...u, isMuted } : u)
                        }));
                    });

                    // Per-user focus mode (mic time exceeded)
                    socket.on('room:personal-focus-mode', ({ enabled, reason, usedSeconds, limitSeconds }: any) => {
                        if (enabled && reason === 'mic_time_exceeded') {
                            set({
                                isPersonalFocusMode: true,
                                isMuted: true,
                                micTimeWarning: `You've used your mic time (${Math.floor(usedSeconds / 60)}m ${usedSeconds % 60}s of ${Math.floor(limitSeconds / 60)}m ${limitSeconds % 60}s allowed). Focus mode activated.`,
                            });
                        } else if (!enabled) {
                            set({ isPersonalFocusMode: false, micTimeWarning: null });
                        }
                    });

                    // Live mic time updates from server
                    socket.on('mic:time-update', ({ usedMs, limitMs }: any) => {
                        set({ micTimeUsedMs: usedMs, micTimeLimitMs: limitMs });
                    });

                    // Wait for connection if not ready
                    if (!socket.connected) {
                        console.log("Socket not connected yet, waiting for connect event...");

                        const timeoutId = setTimeout(() => {
                            console.error("Socket connection timeout (5s) while joining room");
                            set({ error: 'Socket connection timeout. Please refresh.', isLoading: false });
                            socket.off('connect'); // Remove listener
                        }, 5000);

                        socket.once('connect', () => {
                            clearTimeout(timeoutId);
                            console.log("Socket connected, emitting room:join");
                            socket.emit('room:join', { roomId });
                        });
                    } else {
                        console.log("Socket already connected, emitting room:join directly");
                        socket.emit('room:join', { roomId });
                    }
                } else {
                    console.error("socketClient.getSocket() returned null");
                    set({ error: 'Socket not connected', isLoading: false });
                }
            }
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to join room', isLoading: false });
            throw error;
        }
    },

    handleRoomJoined: (payload: any) => {
        set({
            isJoined: true,
            isLoading: false,
            messages: payload.history || [],
            users: payload.users.map((user: any) => ({
                userId: user.userId,
                username: user.username || 'Unknown',
                presence: PresenceStatus.ONLINE,
                joinedAt: Date.now(),
                isOwner: get().ownerId === user.userId,
                isMuted: true,
                audioEnabled: false
            }))
        });
    },

    leaveRoom: () => {
        const { roomId } = get();
        const socket = socketClient.getSocket();

        if (socket && roomId) {
            socket.emit('room:leave', { roomId });
            // Clean up listeners
            socket.off('room:joined');
            socket.off('room:user-joined');
            socket.off('room:user-left');
            socket.off('chat:message');
            socket.off('chat:typing');
            socket.off('room:focus-mode-changed');
            socket.off('room:owner-changed');
            socket.off('room:user-kicked');
            socket.off('audio:user-muted');
            socket.off('room:personal-focus-mode');
            socket.off('mic:time-update');
        }

        set({
            roomId: null,
            isJoined: false,
            messages: [],
            users: [],
            typingUsers: [],
            isPersonalFocusMode: false,
            micTimeUsedMs: 0,
            micTimeLimitMs: 300000,
            micTimeWarning: null,
        });
    },

    sendChatMessage: (content: string) => {
        const { roomId } = get();
        const socket = socketClient.getSocket();
        if (socket && roomId) socket.emit('chat:send', { roomId, content });
    },

    setTyping: (isTyping: boolean) => {
        const { roomId } = get();
        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit(isTyping ? 'chat:typing' : 'chat:stop-typing', { roomId });
        }
    },

    toggleMute: () => {
        const { roomId, isMuted, isFocusMode, isPersonalFocusMode } = get();
        if (isFocusMode || isPersonalFocusMode) return;

        const newMutedState = !isMuted;
        set({ isMuted: newMutedState });

        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit('audio:mute-toggle', { roomId, isMuted: newMutedState });
        }
    },

    toggleFocusMode: () => {
        const { roomId, isFocusMode } = get();
        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit('room:focus-mode', { roomId, enabled: !isFocusMode });
        }
    },

    transferOwnership: (toUserId: string) => {
        const { roomId } = get();
        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit('room:transfer-ownership', { roomId, newOwnerId: toUserId });
        }
    },

    deleteRoom: async () => {
        const { roomId } = get();
        if (!roomId) return;

        try {
            const res = await api.delete(`/rooms/${roomId}`);
            if (res.data.success) {
                get().leaveRoom();
            }
        } catch (error: any) {
            console.error("Failed to delete room:", error);
            set({ error: error.response?.data?.message || 'Failed to delete room' });
        }
    },

    dismissMicWarning: () => {
        set({ micTimeWarning: null });
    }
}));
