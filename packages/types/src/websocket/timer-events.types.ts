import { TimerPhase } from '../enums';

export interface TimerState {
    mode: TimerPhase;
    remainingSeconds: number;
    totalSeconds: number;
    isRunning: boolean;
    startedAt?: number;
    pausedAt?: number;
}

export interface TimerStartPayload {
    roomId: string;
    durationSeconds: number;
    mode: TimerPhase;
}

export interface TimerPausePayload {
    roomId: string;
}

export interface TimerResetPayload {
    roomId: string;
}

export interface TimerSyncEvent {
    roomId: string;
    timerState: TimerState;
}

export interface TimerCompleteEvent {
    roomId: string;
    completedMode: TimerPhase;
    nextMode: TimerPhase;
}
