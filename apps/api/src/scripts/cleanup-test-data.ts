/**
 * Cleanup script to remove test data created by feed_tester_* accounts
 * Run: npx tsx apps/api/src/scripts/cleanup-test-data.ts
 */
import { connectDB, Post, User } from '@studymate/database';
import { connectRedis } from '@studymate/cache';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

async function cleanupTestData() {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB(process.env.MONGODB_URI || '');

    const client = await connectRedis();

    console.log('🔍 Finding test users (username starts with feed_tester_)...');

    // Find all test users
    const testUsers = await User.find({
        username: { $regex: /^feed_tester_/ }
    }).select('_id username');

    console.log(`Found ${testUsers.length} test users.`);
    const testUserIds = testUsers.map(u => u._id);

    if (testUserIds.length > 0) {
        // Find all posts by test users
        const testPosts = await Post.find({
            userId: { $in: testUserIds }
        }).select('_id examCategory subject tags');

        console.log(`Found ${testPosts.length} test posts. Removing from Redis feed sets...`);

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

        // Delete posts from MongoDB
        const deletePostResult = await Post.deleteMany({ userId: { $in: testUserIds } });
        console.log(`✅ Deleted ${deletePostResult.deletedCount} test posts from MongoDB.`);

        // Delete test users from MongoDB
        const deleteUserResult = await User.deleteMany({ _id: { $in: testUserIds } });
        console.log(`✅ Deleted ${deleteUserResult.deletedCount} test users from MongoDB.`);
    } else {
        console.log('No test users found. Nothing to clean up.');
    }

    console.log('🎉 Cleanup complete!');
    process.exit(0);
}

cleanupTestData().catch(err => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
});
