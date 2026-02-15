import { analyticsQueue } from '../queue-client';

export const addDailyStatsJob = async (data: { userId: string; date: string }) => {
    await analyticsQueue.add('calculateDailyStats', data);
};

export const addLeaderboardUpdateJob = async (data: { exam: string }) => {
    await analyticsQueue.add('updateLeaderboard', data, {
        removeOnComplete: true,
        removeOnFail: 5,
    });
};

export const addWeeklyReportJob = async (data: { userId: string }) => {
    await analyticsQueue.add('generateWeeklyReport', data);
};
