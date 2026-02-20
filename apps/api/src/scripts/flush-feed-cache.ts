/**
 * Script to flush all feed-related Redis keys that have stale/test data
 */
import { connectRedis } from '@studymate/cache';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function flushFeedCache() {
    console.log('🔌 Connecting to Redis...');
    const client = await connectRedis();

    // Get all feed-related keys
    const feedLatestKeys = await client.keys('feed:latest:*');
    const feedTrendingKeys = await client.keys('feed:trending:*');
    const feedSubjectKeys = await client.keys('feed:subject:*');
    const feedTagKeys = await client.keys('feed:tag:*');
    const postCacheKeys = await client.keys('post:*');

    const allKeys = [...feedLatestKeys, ...feedTrendingKeys, ...feedSubjectKeys, ...feedTagKeys, ...postCacheKeys];

    console.log(`Found ${allKeys.length} cache keys to delete:`);
    console.log('  Feed Latest keys:', feedLatestKeys);
    console.log('  Feed Trending keys:', feedTrendingKeys);
    console.log('  Feed Subject keys:', feedSubjectKeys.length);
    console.log('  Feed Tag keys:', feedTagKeys.length);
    console.log('  Post cache keys:', postCacheKeys.length);

    if (allKeys.length > 0) {
        await client.del(allKeys);
        console.log(`✅ Deleted ${allKeys.length} keys from Redis.`);
    } else {
        console.log('No feed cache keys found.');
    }

    console.log('🎉 Redis feed cache flushed! The feed will now lazily reload from MongoDB on next request.');
    process.exit(0);
}

flushFeedCache().catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
});
