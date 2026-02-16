import { StudySession, User } from '@studymate/database';
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

/**
 * Calculate study streaks for a user.
 * A streak day = any day with at least one completed study session.
 * Walks backwards from today to count currentStreak, and scans all days for longestStreak.
 */
export const calculateStreaks = async (userId: string): Promise<{ currentStreak: number; longestStreak: number }> => {
    const sessions = await StudySession.find({
        userId,
        isActive: false,
        durationMinutes: { $gt: 0 },
    }).select('startTime').sort({ startTime: -1 });

    if (sessions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Build a set of unique study dates (YYYY-MM-DD in local timezone)
    const studyDates = new Set<string>();
    for (const session of sessions) {
        const dateStr = session.startTime.toISOString().split('T')[0];
        studyDates.add(dateStr);
    }

    // Sort dates descending
    const sortedDates = Array.from(studyDates).sort((a, b) => b.localeCompare(a));

    // Calculate current streak — walk backwards from today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    let currentStreak = 0;

    // Streak can start from today or yesterday
    let checkDate: Date;
    if (studyDates.has(todayStr)) {
        checkDate = new Date(today);
    } else if (studyDates.has(yesterdayStr)) {
        checkDate = new Date(yesterdayDate);
    } else {
        // No recent study — current streak is 0
        checkDate = new Date(0); // will not match anything
    }

    if (checkDate.getTime() > 0) {
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (studyDates.has(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }

    // Calculate longest streak — walk through all sorted dates
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    return { currentStreak, longestStreak };
};

export const calculateUserStats = async (userId: string): Promise<UserStats> => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [allSessions, streaks] = await Promise.all([
        StudySession.find({
            userId,
            isActive: false,
            durationMinutes: { $gt: 0 },
        }),
        calculateStreaks(userId),
    ]);

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
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        weeklyHours: Math.round((weeklyMinutes / 60) * 100) / 100,
        monthlyHours: Math.round((monthlyMinutes / 60) * 100) / 100,
    };
};

/**
 * Update a user's study statistics after a session ends.
 * Updates totalStudyHours, streaks on the User model, and the leaderboard.
 */
export const updateUserStudyStats = async (userId: string, sessionDurationMinutes: number): Promise<void> => {
    const streaks = await calculateStreaks(userId);

    // Recalculate total study hours from all sessions
    const allSessions = await StudySession.find({
        userId,
        isActive: false,
        durationMinutes: { $gt: 0 },
    }).select('durationMinutes');

    const totalMinutes = allSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    const user = await User.findByIdAndUpdate(userId, {
        totalStudyHours: totalHours,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
    }, { new: true });

    // Update leaderboard
    if (user) {
        await LeaderboardCache.updateUserScore(user.examCategory, userId, totalHours);
    }
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
