import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversationDocument extends Document {
    participants: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversationDocument>(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
        lastMessageAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Index for finding conversations by participants
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
