import { Conversation, Message, MessageStatus, MessageType } from '@studymate/database';
import { SocketService } from './SocketService';
import { Types } from 'mongoose';
import { createLogger } from '@studymate/logger';

const logger = createLogger('chat-service');

export class ChatService {
    static async startConversation(participants: string[]) {
        // Sort participants to ensure consistent finding
        const sortedParticipants = participants.sort();

        let conversation = await Conversation.findOne({
            participants: { $all: sortedParticipants, $size: sortedParticipants.length }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: sortedParticipants
            });
            logger.info(`Created new conversation: ${conversation._id}`);
        }

        return conversation;
    }

    static async sendMessage(senderId: string, text: string, options: { conversationId?: string, roomId?: string, type?: MessageType }) {
        const { conversationId, roomId, type = MessageType.TEXT } = options;

        if (!conversationId && !roomId) {
            throw new Error('Either conversationId or roomId must be provided');
        }

        const message = await Message.create({
            conversationId,
            roomId,
            senderId,
            text,
            messageType: type,
            status: MessageStatus.SENT
        });

        if (conversationId) {
            // Update conversation lastMessage
            // @ts-ignore
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: message._id,
                lastMessageAt: new Date()
            });

            // Emit real-time event to conversation
            SocketService.io.to(`conversation:${conversationId}`).emit('new_message', message);

            // Emit notifications
            const conversation = await Conversation.findById(conversationId);
            if (conversation) {
                conversation.participants.forEach((participantId: Types.ObjectId) => {
                    if (participantId.toString() !== senderId) {
                        SocketService.io.to(`user:${participantId}`).emit('notification', {
                            type: 'NEW_MESSAGE',
                            message
                        });
                    }
                });
            }
        } else if (roomId) {
            // Emit real-time event to room
            SocketService.io.to(`room:${roomId}`).emit('new_message', message);
        }

        return message;
    }

    static async getMessages(options: { conversationId?: string, roomId?: string, limit?: number, skip?: number }) {
        const { conversationId, roomId, limit = 50, skip = 0 } = options;
        const query: any = {};
        if (conversationId) query.conversationId = conversationId;
        if (roomId) query.roomId = roomId;

        return Message.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'fullName username profilePicture');
    }

    static async getUserConversations(userId: string) {
        return Conversation.find({ participants: userId })
            .sort({ lastMessageAt: -1 })
            .populate('participants', 'fullName username profilePicture')
            .populate('lastMessage');
    }
}
