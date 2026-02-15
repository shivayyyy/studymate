import { getRedisClient } from './redis-client';

export class CacheManager {
    static async get<T>(key: string): Promise<T | null> {
        const client = getRedisClient();
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    }

    static async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        const client = getRedisClient();
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
            await client.setEx(key, ttlSeconds, serialized);
        } else {
            await client.set(key, serialized);
        }
    }

    static async del(key: string): Promise<void> {
        const client = getRedisClient();
        await client.del(key);
    }

    static async exists(key: string): Promise<boolean> {
        const client = getRedisClient();
        const result = await client.exists(key);
        return result === 1;
    }

    static async incr(key: string): Promise<number> {
        const client = getRedisClient();
        return client.incr(key);
    }

    static async decr(key: string): Promise<number> {
        const client = getRedisClient();
        return client.decr(key);
    }

    static async sAdd(key: string, value: string): Promise<void> {
        const client = getRedisClient();
        await client.sAdd(key, value);
    }

    static async sRem(key: string, value: string): Promise<void> {
        const client = getRedisClient();
        await client.sRem(key, value);
    }

    static async sMembers(key: string): Promise<string[]> {
        const client = getRedisClient();
        return client.sMembers(key);
    }

    static async zAdd(key: string, score: number, value: string): Promise<void> {
        const client = getRedisClient();
        await client.zAdd(key, { score, value });
    }

    static async zRangeWithScores(key: string, start: number, stop: number, rev = true) {
        const client = getRedisClient();
        // @ts-ignore - redis types are tricky with the options object overload
        return client.zRange(key, start, stop, { REV: rev, WITHSCORES: true });
    }

    static async zRevRank(key: string, member: string): Promise<number | null> {
        const client = getRedisClient();
        return client.zRevRank(key, member);
    }

    static async expire(key: string, ttlSeconds: number): Promise<void> {
        const client = getRedisClient();
        await client.expire(key, ttlSeconds);
    }
}
