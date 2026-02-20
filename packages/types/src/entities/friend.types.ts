
export interface FriendRequest {
    _id: string;
    senderId: string | { _id: string; username: string; fullName: string; profilePicture?: string };
    receiverId: string | { _id: string; username: string; fullName: string; profilePicture?: string };
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export type RelationshipStatus =
    | { status: 'none' }
    | { status: 'pending_sent'; requestId: string }
    | { status: 'pending_received'; requestId: string }
    | { status: 'friends' };
