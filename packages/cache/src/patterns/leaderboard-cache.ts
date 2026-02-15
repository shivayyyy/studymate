import { CacheManager } from '../cache-manager';
import { RedisKeys, RedisTTL } from '@studymate/config';

export class LeaderboardCache {
    static async updateUserScore(exam: string, userId: string, score: number): Promise<void> {
        await CacheManager.zAdd(RedisKeys.leaderboardWeekly(exam), score, userId);
        await CacheManager.expire(RedisKeys.leaderboardWeekly(exam), RedisTTL.LEADERBOARD_WEEKLY);
    }

    static async getTopUsers(exam: string, limit = 100) {
        const results = await CacheManager.zRangeWithScores(RedisKeys.leaderboardWeekly(exam), 0, limit - 1, true);
        return results.map((r: any) => ({ userId: r.value, score: r.score }));
    }

    static async getUserRank(exam: string, userId: string): Promise<number | null> {
        const rank = await CacheManager.zRevRank(RedisKeys.leaderboardWeekly(exam), userId);
        return rank !== null ? rank + 1 : null;
    }
}
