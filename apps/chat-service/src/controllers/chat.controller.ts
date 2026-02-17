import type { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';
import { asyncHandler, success } from '@studymate/utils';

// Simple error class since we are not reusing the API's middleware directly yet
class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class ChatController {
    static startConversation = asyncHandler(async (req: Request, res: Response) => {
        const { participantId } = req.body;
        // @ts-ignore
        const currentUserId = req.user!.userId;

        if (!participantId) {
            throw new AppError('Participant ID is required', 400);
        }

        const conversation = await ChatService.startConversation([currentUserId, participantId]);
        res.json(success(conversation, 'Conversation started'));
    });

    static getConversations = asyncHandler(async (req: Request, res: Response) => {
        // @ts-ignore
        const currentUserId = req.user!.userId;
        const conversations = await ChatService.getUserConversations(currentUserId);
        res.json(success(conversations, 'Conversations retrieved'));
    });

    static getMessages = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId, roomId } = req.params;
        const { limit, skip } = req.query;

        const messages = await ChatService.getMessages({
            conversationId: conversationId as string,
            roomId: roomId as string,
            limit: Number(limit) || 50,
            skip: Number(skip) || 0
        });
        res.json(success(messages, 'Messages retrieved'));
    });

    static sendMessage = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId, roomId } = req.params;
        const { text, type } = req.body;
        // @ts-ignore
        const currentUserId = req.user!.userId;

        if (!text) {
            throw new AppError('Message text is required', 400);
        }

        const message = await ChatService.sendMessage(currentUserId, text, {
            conversationId: conversationId as string,
            roomId: roomId as string,
            type
        });
        res.json(success(message, 'Message sent'));
    });
}
