import { CacheManager } from '../cache-manager';
import { RedisKeys, RedisTTL } from '@studymate/config';

export class FeedCache {
    static async setUserFeed(userId: string, posts: any[]): Promise<void> {
        await CacheManager.set(RedisKeys.userFeed(userId), posts, RedisTTL.USER_FEED);
    }

    static async getUserFeed(userId: string): Promise<any[] | null> {
        return CacheManager.get(RedisKeys.userFeed(userId));
    }

    static async setTrendingPosts(exam: string, posts: any[]): Promise<void> {
        await CacheManager.set(RedisKeys.trendingFeed(exam), posts, RedisTTL.TRENDING_FEED);
    }

    static async getTrendingPosts(exam: string): Promise<any[] | null> {
        return CacheManager.get(RedisKeys.trendingFeed(exam));
    }

    static async invalidateUserFeed(userId: string): Promise<void> {
        await CacheManager.del(RedisKeys.userFeed(userId));
    }
}
