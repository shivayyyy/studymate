import { PresenceStatus } from '../enums';

export interface PresenceUpdatePayload {
    userId: string;
    roomId: string;
    status: PresenceStatus;
}

export interface PresenceBroadcastEvent {
    userId: string;
    status: PresenceStatus;
    lastSeenAt: number;
}
