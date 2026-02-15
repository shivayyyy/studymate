import { CacheManager } from '../cache-manager';
import { RedisKeys, RedisTTL } from '@studymate/config';

export class SessionCache {
    static async setActiveSession(userId: string, session: any): Promise<void> {
        await CacheManager.set(RedisKeys.activeSession(userId), session, RedisTTL.SESSION_ACTIVE);
    }

    static async getActiveSession(userId: string): Promise<any | null> {
        return CacheManager.get(RedisKeys.activeSession(userId));
    }

    static async clearActiveSession(userId: string): Promise<void> {
        await CacheManager.del(RedisKeys.activeSession(userId));
    }
}
