export interface ChatMessage {
    id: string;
    roomId: string;
    userId: string;
    username: string;
    content: string;
    timestamp: number;
}

export interface SendMessagePayload {
    roomId: string;
    content: string;
}

export interface DeleteMessagePayload {
    roomId: string;
    messageId: string;
}

export interface TypingPayload {
    roomId: string;
    userId: string;
}

export interface TypingEvent {
    userId: string;
    username: string;
    isTyping: boolean;
}
