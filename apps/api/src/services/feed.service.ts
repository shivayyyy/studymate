
import { Post } from '@studymate/database';
import { RedisKeys, RedisTTL } from '@studymate/config';
import { connectRedis } from '@studymate/cache';

export class FeedService {
    private static FEED_LIMIT = 5000;
    private static POST_CACHE_TTL = 300; // 5 minutes
    private static SEED_BATCH_SIZE = 200; // How many posts to seed per category on cache miss

    /**
     * Add a post to all relevant feeds (Latest, Trending, Subject, Tags)
     */
    static async addPost(post: any): Promise<void> {
        const client = await connectRedis();
        const { _id, examCategory, subject, tags, createdAt } = post;
        const postId = _id.toString();
        const score = new Date(createdAt).getTime();

        const pipeline = client.multi();

        // 1. Latest Feed
        const latestKey = RedisKeys.feedLatest(examCategory);
        pipeline.zAdd(latestKey, { score, value: postId });
        pipeline.zRemRangeByRank(latestKey, 0, -(FeedService.FEED_LIMIT + 1));

        // 2. Trending Feed (Initial score = engagement score or 0)
        const trendingKey = RedisKeys.feedTrending(examCategory);
        pipeline.zAdd(trendingKey, { score: post.engagementScore || 0, value: postId });
        pipeline.zRemRangeByRank(trendingKey, 0, -(FeedService.FEED_LIMIT + 1));

        // 3. Subject Feed
        if (subject) {
            const subjectKey = RedisKeys.feedSubject(examCategory, subject);
            pipeline.zAdd(subjectKey, { score, value: postId });
            pipeline.zRemRangeByRank(subjectKey, 0, -(FeedService.FEED_LIMIT + 1));
        }

        // 4. Tag Feeds
        if (tags && tags.length > 0) {
            tags.forEach((tag: string) => {
                const tagKey = RedisKeys.feedTag(examCategory, tag);
                pipeline.zAdd(tagKey, { score, value: postId });
                pipeline.zRemRangeByRank(tagKey, 0, -(FeedService.FEED_LIMIT + 1));
            });
        }

        await pipeline.exec();

        // Cache the post object
        await this.cachePost(post);
    }

    /**
     * Update engagement score in the Trending feed
     */
    static async updateEngagement(post: any): Promise<void> {
        const client = await connectRedis();
        const { _id, examCategory, engagementScore } = post;
        const postId = _id.toString();

        await client.zAdd(RedisKeys.feedTrending(examCategory), {
            score: engagementScore,
            value: postId
        });

        // Update cached post
        await this.cachePost(post);
    }

    /**
     * Remove post from all feeds and cache
     */
    static async removePost(post: any): Promise<void> {
        const client = await connectRedis();
        const { _id, examCategory, subject, tags } = post;
        const postId = _id.toString();

        const pipeline = client.multi();

        pipeline.zRem(RedisKeys.feedLatest(examCategory), postId);
        pipeline.zRem(RedisKeys.feedTrending(examCategory), postId);
        if (subject) {
            pipeline.zRem(RedisKeys.feedSubject(examCategory, subject), postId);
        }

        if (tags && tags.length > 0) {
            tags.forEach((tag: string) => {
                pipeline.zRem(RedisKeys.feedTag(examCategory, tag), postId);
            });
        }

        pipeline.del(RedisKeys.post(postId));

        await pipeline.exec();
    }

    /**
     * Cache a post object in Redis
     */
    static async cachePost(post: any): Promise<void> {
        const client = await connectRedis();
        // Ensure we store a plain object
        const postObj = post.toObject ? post.toObject() : post;
        await client.setEx(
            RedisKeys.post(postObj._id.toString()),
            FeedService.POST_CACHE_TTL,
            JSON.stringify(postObj)
        );
    }

    /**
     * Get a cached post by ID
     */
    static async getCachedPost(postId: string): Promise<any | null> {
        const client = await connectRedis();
        const data = await client.get(RedisKeys.post(postId));
        return data ? JSON.parse(data) : null;
    }

    /**
     * Seed a Redis sorted set from MongoDB when the set is empty.
     * This is the cache-aside / lazy-seeding pattern — ensures the feed
     * always works even after a Redis flush, restart, or first deploy.
     */
    static async seedFeedFromDB(options: {
        type: 'latest' | 'trending' | 'subject' | 'tag';
        examCategory: string;
        value?: string;
        key: string;
    }): Promise<void> {
        const { type, examCategory, value, key } = options;
        const client = await connectRedis();

        // Build MongoDB filter based on feed type
        const filter: any = { isActive: true };
        if (examCategory !== 'all') filter.examCategory = examCategory;
        if (type === 'subject' && value) filter.subject = value;
        if (type === 'tag' && value) filter.tags = value;

        // Determine sort field
        const sort: any = type === 'trending'
            ? { engagementScore: -1, createdAt: -1 }
            : { createdAt: -1 };

        console.log(`[FeedService] Redis key "${key}" is empty. Seeding from DB (type=${type}, category=${examCategory})`);

        const posts = await Post.find(filter)
            .sort(sort)
            .limit(FeedService.SEED_BATCH_SIZE)
            .populate('userId', 'username fullName profilePicture');

        if (posts.length === 0) {
            console.log(`[FeedService] No posts in DB to seed for key "${key}"`);
            return;
        }

        // Bulk insert into sorted set + cache individual post objects
        const pipeline = client.multi();
        for (const post of posts) {
            const postId = post._id.toString();
            const score = type === 'trending'
                ? (post as any).engagementScore || 0
                : new Date(post.createdAt as Date).getTime();
            pipeline.zAdd(key, { score, value: postId });
        }
        await pipeline.exec();

        // Cache the post objects concurrently
        await Promise.all(posts.map(p => this.cachePost(p)));

        console.log(`[FeedService] Seeded ${posts.length} posts into Redis key "${key}"`);
    }

    /**
     * Get feed posts using Cursor-based pagination.
     * Cursor = score (timestamp or engagementScore).
     *
     * IMPORTANT: If the sorted set is empty in Redis (cache miss / flush),
     * we seed it from MongoDB (lazy cache-aside pattern) before serving.
     */
    static async getFeed(options: {
        examCategory: string;
        userId?: string;
        type: 'latest' | 'trending' | 'subject' | 'tag';
        value?: string;
        cursor?: number;
        limit?: number;
    }): Promise<{ posts: any[]; nextCursor: number | null }> {
        const client = await connectRedis();
        const { examCategory, userId, type, value, cursor, limit = 20 } = options;

        let key = '';
        switch (type) {
            case 'latest':
                key = RedisKeys.feedLatest(examCategory);
                break;
            case 'trending':
                key = RedisKeys.feedTrending(examCategory);
                break;
            case 'subject':
                if (!value) throw new Error('Subject is required for subject feed');
                key = RedisKeys.feedSubject(examCategory, value);
                break;
            case 'tag':
                if (!value) throw new Error('Tag is required for tag feed');
                key = RedisKeys.feedTag(examCategory, value);
                break;
        }

        // --- Cache-Aside / Lazy Seeding ---
        // Only check cardinality on first page requests (cursor=undefined)
        // to avoid unnecessary ZCARD calls on every paginated request
        if (!cursor) {
            const setSize = await client.zCard(key);
            if (setSize === 0) {
                // Sorted set is empty — seed from DB before proceeding
                await this.seedFeedFromDB({ type, examCategory, value, key });
            }
        }
        // ----------------------------------

        const max = cursor ? `(${cursor}` : '+inf';

        // Fetch IDs from Redis sorted set
        const postIds = await client.zRange(key, max, '-inf', {
            BY: 'SCORE',
            REV: true,
            LIMIT: { offset: 0, count: limit }
        });

        if (postIds.length === 0) {
            // Even after seeding, no posts exist at all
            return { posts: [], nextCursor: null };
        }

        // Fetch posts from Cache or DB (individual post objects)
        const postsMap: Map<string, any> = new Map();
        const missingIds: string[] = [];

        // Check cache for each post
        const cachedResults = await Promise.all(
            postIds.map(id => this.getCachedPost(id))
        );

        cachedResults.forEach((cached, i) => {
            if (cached) {
                postsMap.set(postIds[i], cached);
            } else {
                missingIds.push(postIds[i]);
            }
        });

        // Fetch missing posts from DB
        if (missingIds.length > 0) {
            const dbPosts = await Post.find({ _id: { $in: missingIds }, isActive: true })
                .populate('userId', 'username fullName profilePicture');

            const idsToRemove: string[] = [];
            for (const post of dbPosts) {
                await this.cachePost(post);
                postsMap.set(post._id.toString(), post.toObject());
            }

            // Find IDs that are in Redis but no longer in DB (deleted posts not cleaned up)
            const foundIds = new Set(dbPosts.map(p => p._id.toString()));
            for (const id of missingIds) {
                if (!foundIds.has(id)) {
                    idsToRemove.push(id);
                }
            }

            // Clean up stale IDs from all feed keys
            if (idsToRemove.length > 0) {
                console.log(`[FeedService] Cleaning ${idsToRemove.length} stale post IDs from key "${key}"`);
                const cleanupPipeline = client.multi();
                for (const staleId of idsToRemove) {
                    cleanupPipeline.zRem(key, staleId);
                }
                await cleanupPipeline.exec();
            }
        }

        // Re-order posts to match Redis sorted set order
        const sortedPosts = postIds
            .map(id => postsMap.get(id))
            .filter(p => p !== undefined);

        // Check "isLiked" status if userId is provided
        if (userId && sortedPosts.length > 0) {
            const likePipeline = client.multi();
            sortedPosts.forEach(post => {
                likePipeline.sIsMember(RedisKeys.postLikes(post._id.toString()), userId);
            });

            const results = await likePipeline.exec();
            sortedPosts.forEach((post, index) => {
                post.isLiked = !!results[index];
            });
        }

        // Determine next cursor
        let nextCursor: number | null = null;
        if (sortedPosts.length === limit) {
            const lastPost = sortedPosts[sortedPosts.length - 1];
            nextCursor = type === 'trending'
                ? lastPost.engagementScore
                : new Date(lastPost.createdAt).getTime();
        }

        return { posts: sortedPosts, nextCursor };
    }
}
