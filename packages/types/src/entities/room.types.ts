import { ExamCategory, TimerMode } from '../enums';

export interface IRoom {
    _id: string;
    name: string;
    examCategory: ExamCategory;
    subject: string;
    timerMode: TimerMode;
    customTimerConfig?: {
        focusMinutes: number;
        breakMinutes: number;
    };
    currentOccupancy: number;
    maxOccupancy: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRoomCreate {
    name: string;
    examCategory: ExamCategory;
    subject: string;
    timerMode: TimerMode;
    customTimerConfig?: {
        focusMinutes: number;
        breakMinutes: number;
    };
    maxOccupancy?: number;
}
