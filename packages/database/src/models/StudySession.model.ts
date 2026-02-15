import mongoose, { Schema, Document } from 'mongoose';

export interface IStudySessionDocument extends Document {
    userId: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    durationMinutes?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StudySessionSchema = new Schema<IStudySessionDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
        startTime: { type: Date, required: true, default: Date.now },
        endTime: { type: Date },
        durationMinutes: { type: Number },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

StudySessionSchema.index({ userId: 1, startTime: -1 });
StudySessionSchema.index({ userId: 1, isActive: 1 });
StudySessionSchema.index({ roomId: 1, startTime: -1 });

// Calculate duration before saving
StudySessionSchema.pre('save', function (next) {
    if (this.endTime && this.startTime) {
        this.durationMinutes = Math.round(
            (this.endTime.getTime() - this.startTime.getTime()) / 60000,
        );
    }
    next();
});

export const StudySession = mongoose.model<IStudySessionDocument>(
    'StudySession',
    StudySessionSchema,
);
