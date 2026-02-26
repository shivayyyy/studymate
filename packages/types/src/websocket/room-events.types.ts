import { PresenceStatus } from '../enums';
import { TimerState } from './timer-events.types';


export interface JoinRoomPayload {
    roomId: string;
    userId: string;
}

export interface LeaveRoomPayload {
    roomId: string;
    userId: string;
}

export interface RoomJoinedResponse {
    roomId: string;
    state: RoomState;
    users: RoomUser[];
}

export interface RoomUserJoinedEvent {
    userId: string;
    username: string;
    occupancy: number;
}

export interface RoomUserLeftEvent {
    userId: string;
    occupancy: number;
}

export interface RoomState {
    roomId: string;
    occupancy: number;
    timerState: TimerState | null;
    users: RoomUser[];
}

export interface RoomUser {
    userId: string;
    username: string;
    profilePicture?: string;
    isOwner: boolean;
    isMuted: boolean;
    audioEnabled: boolean;
    presence: PresenceStatus;
    joinedAt: number;
}

export interface AudioMuteTogglePayload {
    roomId: string;
    isMuted: boolean;
}

export interface AudioUserMutedEvent {
    userId: string;
    isMuted: boolean;
}

export interface RoomTransferOwnershipPayload {
    roomId: string;
    newOwnerId: string;
}

export interface RoomOwnerChangedEvent {
    previousOwnerId: string;
    newOwnerId: string;
}

export interface RoomKickUserPayload {
    roomId: string;
    targetUserId: string;
}

export interface RoomUserKickedEvent {
    userId: string;
    reason?: string;
}

export interface RoomFocusModePayload {
    roomId: string;
    enabled: boolean;
}

export interface RoomFocusModeChangedEvent {
    roomId: string;
    enabled: boolean;
    changedBy: string;
}

export interface RoomErrorEvent {
    message: string;
}
