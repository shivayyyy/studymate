
export interface FriendRequestEvent {
    requestId: string;
    sender: { _id: string; username: string; fullName: string; profilePicture?: string };
}

export interface FriendRequestAcceptedEvent {
    requestId: string;
    acceptedBy: { _id: string; username: string; fullName: string; profilePicture?: string };
}
