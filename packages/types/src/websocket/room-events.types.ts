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
    presence: PresenceStatus;
    joinedAt: number;
}
