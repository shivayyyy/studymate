import { StudySession } from '@studymate/database';
import { LeaderboardCache } from '@studymate/cache';

export interface UserStats {
    totalStudyHours: number;
    totalSessions: number;
    averageSessionDuration: number;
    currentStreak: number;
    longestStreak: number;
    weeklyHours: number;
    monthlyHours: number;
}

export const calculateUserStats = async (userId: string): Promise<UserStats> => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allSessions = await StudySession.find({
        userId,
        isActive: false,
        durationMinutes: { $gt: 0 },
    });

    const weeklySessions = allSessions.filter(
        (s) => s.startTime >= weekAgo,
    );
    const monthlySessions = allSessions.filter(
        (s) => s.startTime >= monthAgo,
    );

    const totalMinutes = allSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const weeklyMinutes = weeklySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const monthlyMinutes = monthlySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    return {
        totalStudyHours: Math.round((totalMinutes / 60) * 100) / 100,
        totalSessions: allSessions.length,
        averageSessionDuration: allSessions.length > 0 ? Math.round(totalMinutes / allSessions.length) : 0,
        currentStreak: 0, // TODO: implement streak calculation
        longestStreak: 0,
        weeklyHours: Math.round((weeklyMinutes / 60) * 100) / 100,
        monthlyHours: Math.round((monthlyMinutes / 60) * 100) / 100,
    };
};

export const updateLeaderboard = async (exam: string, userId: string, studyHours: number) => {
    await LeaderboardCache.updateUserScore(exam, userId, studyHours);
};

export const getLeaderboard = async (exam: string, limit = 100) => {
    return LeaderboardCache.getTopUsers(exam, limit);
};

export const getUserRank = async (exam: string, userId: string) => {
    return LeaderboardCache.getUserRank(exam, userId);
};
