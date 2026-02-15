import { TimerMode } from '@studymate/types';

export interface TimerPreset {
    mode: TimerMode;
    label: string;
    focusMinutes: number;
    breakMinutes: number;
    longBreakMinutes: number;
    sessionsBeforeLongBreak: number;
}

export const TIMER_PRESETS: Record<TimerMode, TimerPreset> = {
    [TimerMode.POMODORO_25_5]: {
        mode: TimerMode.POMODORO_25_5,
        label: 'Classic Pomodoro (25/5)',
        focusMinutes: 25,
        breakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
    },
    [TimerMode.EXTENDED_45_10]: {
        mode: TimerMode.EXTENDED_45_10,
        label: 'Extended Focus (45/10)',
        focusMinutes: 45,
        breakMinutes: 10,
        longBreakMinutes: 20,
        sessionsBeforeLongBreak: 3,
    },
    [TimerMode.LONG_90_20]: {
        mode: TimerMode.LONG_90_20,
        label: 'Deep Work (90/20)',
        focusMinutes: 90,
        breakMinutes: 20,
        longBreakMinutes: 30,
        sessionsBeforeLongBreak: 2,
    },
    [TimerMode.CUSTOM]: {
        mode: TimerMode.CUSTOM,
        label: 'Custom',
        focusMinutes: 25,
        breakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
    },
};

export const getTimerPreset = (mode: TimerMode): TimerPreset => {
    return TIMER_PRESETS[mode];
};
