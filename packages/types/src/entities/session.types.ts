export interface IStudySession {
    _id: string;
    userId: string;
    roomId: string;
    startTime: Date;
    endTime?: Date;
    durationMinutes?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStudySessionCreate {
    userId: string;
    roomId: string;
}
