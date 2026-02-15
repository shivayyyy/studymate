import { CacheManager } from '../cache-manager';
import { RedisKeys, RedisTTL } from '@studymate/config';

export class UserCache {
    static async setProfile(userId: string, profile: any): Promise<void> {
        await CacheManager.set(RedisKeys.userProfile(userId), profile, RedisTTL.USER_PROFILE);
    }

    static async getProfile(userId: string): Promise<any | null> {
        return CacheManager.get(RedisKeys.userProfile(userId));
    }

    static async invalidateProfile(userId: string): Promise<void> {
        await CacheManager.del(RedisKeys.userProfile(userId));
    }

    static async setPresence(userId: string, status: string): Promise<void> {
        await CacheManager.set(RedisKeys.userPresence(userId), { status, lastSeen: Date.now() }, RedisTTL.USER_PRESENCE);
    }

    static async getPresence(userId: string): Promise<any | null> {
        return CacheManager.get(RedisKeys.userPresence(userId));
    }
}
