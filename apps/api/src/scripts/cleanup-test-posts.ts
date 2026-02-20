/**
 * Cleanup script to remove test posts that have denormalized authorUsername matching feed_tester_*
 * Run: bun tsx apps/api/src/scripts/cleanup-test-posts.ts (with env vars exported)
 */
import { connectDB, Post } from '@studymate/database';
import { connectRedis } from '@studymate/cache';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function cleanupTestPosts() {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB(process.env.MONGODB_URI!);

    const client = await connectRedis();

    console.log('🔍 Finding test posts (authorUsername starts with feed_tester_)...');

    const testPosts = await Post.find({
        $or: [
            { authorUsername: { $regex: /^feed_tester_/ } },
            { 'userId.username': { $regex: /^feed_tester_/ } }
        ]
    }).select('_id examCategory subject tags authorUsername');

    console.log(`Found ${testPosts.length} test posts.`);

    if (testPosts.length === 0) {
        console.log('Nothing to clean up.');
        process.exit(0);
    }

    // Remove from Redis
    const pipeline = client.multi();
    for (const post of testPosts) {
        const postId = post._id.toString();
        const cat = post.examCategory;

        pipeline.zRem(`feed:latest:${cat}`, postId);
        pipeline.zRem(`feed:trending:${cat}`, postId);
        if (post.subject) {
            pipeline.zRem(`feed:subject:${cat}:${post.subject}`, postId);
        }
        if (post.tags?.length) {
            for (const tag of post.tags) {
                pipeline.zRem(`feed:tag:${cat}:${tag}`, postId);
            }
        }
        pipeline.del(`post:${postId}`);
    }
    await pipeline.exec();
    console.log('✅ Redis feed sets cleaned.');

    // Delete from MongoDB
    const ids = testPosts.map(p => p._id);
    const deleteResult = await Post.deleteMany({ _id: { $in: ids } });
    console.log(`✅ Deleted ${deleteResult.deletedCount} test posts from MongoDB.`);

    console.log('🎉 Cleanup complete!');
    process.exit(0);
}

cleanupTestPosts().catch(err => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
});
