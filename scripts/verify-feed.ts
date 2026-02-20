
import { config } from 'dotenv';
import path from 'path';
import { createClient } from 'redis';

// Load env
config({ path: path.resolve(__dirname, '../apps/api/.env') });

const API_URL = 'http://localhost:3001/api/v1';

async function main() {
    try {
        // Connect to Redis for direct verification
        const client = createClient({ url: process.env.REDIS_URL });
        await client.connect();

        const timestamp = Date.now();
        const token = await loginUser(`feed_tester_${timestamp}`);
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 1. Create Posts
        console.log('\n1. Creating Posts...');
        const postsToCreate = [
            { title: 'Post 1 JEE Math', subject: 'Math', examCategory: 'JEE', tags: ['calculus'] },
            { title: 'Post 2 NEET Bio', subject: 'Biology', examCategory: 'NEET', tags: ['genetics'] },
            { title: 'Post 3 JEE Phy', subject: 'Physics', examCategory: 'JEE', tags: ['mechanics'] },
        ];

        const createdPosts = [];
        for (const p of postsToCreate) {
            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    description: 'Test description',
                    contentType: 'NOTES',
                    ...p
                })
            });
            const data = (await res.json()) as any;
            if (!data.success) throw new Error(`Create failed: ${JSON.stringify(data)}`);
            createdPosts.push(data.data);
            console.log(`   - Created ${p.title} (${data.data._id})`);
        }

        // Validate Key Existence
        console.log('\n--- Debugging Redis Keys ---');
        const latestKey = `feed:exam:JEE:latest`;
        const exists = await client.exists(latestKey);
        console.log(`Key ${latestKey} exists: ${exists}`);
        if (exists) {
            const members = await client.zRangeWithScores(latestKey, 0, -1);
            console.log(`Members in ${latestKey}:`, members);
        } else {
            console.error(`FAILURE: Key ${latestKey} should exist but does not.`);
        }

        // 2. Verify Latest Feed (JEE)
        console.log('\n2. Verifying Latest Feed (JEE)...');
        const feedRes = await fetch(`${API_URL}/posts?type=latest&examCategory=JEE`, { headers });
        const feedData = (await feedRes.json()) as any;
        const feedPosts = feedData.data;

        console.log(`   - Brought ${feedPosts.length} posts`);
        const foundPost3 = feedPosts.find((p: any) => p.title === 'Post 3 JEE Phy');
        const foundPost1 = feedPosts.find((p: any) => p.title === 'Post 1 JEE Math');

        if (foundPost3 && foundPost1) {
            console.log('   - SUCCESS: Found expected JEE posts in feed');
            // Verify order (Post 3 should be before Post 1 if created later)
            if (new Date(foundPost3.createdAt) > new Date(foundPost1.createdAt)) {
                console.log('   - SUCCESS: Order is correct (Latest first)');
            }
        } else {
            console.error('   - FAILURE: Missing posts in JEE feed', feedPosts.map((p: any) => p.title));
            process.exit(1);
        }

        // 3. Verify Subject Feed
        console.log('\n3. Verifying Subject Feed (Math)...');
        const subjectRes = await fetch(`${API_URL}/posts?type=subject&examCategory=JEE&subject=Math`, { headers });
        const subjectData = (await subjectRes.json()) as any;
        if (subjectData.data.length > 0 && subjectData.data[0].subject === 'Math') {
            console.log('   - SUCCESS: Subject feed works');
        } else {
            console.error('   - FAILURE: Subject feed empty or wrong', subjectData);
        }

        // 4. Verify Trending (Engagement Score)
        console.log('\n4. Verifying Trending Feed logic...');
        // Like Post 1
        const p1Id = createdPosts[0]._id;
        console.log(`   - Liking Post 1 (${p1Id})...`);
        await fetch(`${API_URL}/posts/${p1Id}/like`, { method: 'POST', headers });

        // Fetch Trending
        const trendingRes = await fetch(`${API_URL}/posts?type=trending&examCategory=JEE`, { headers });
        const trendingData = (await trendingRes.json()) as any;
        const topPost = trendingData.data[0];

        if (topPost._id === p1Id) {
            console.log('   - SUCCESS: Liked post is #1 in Trending');
        } else {
            console.log('   - WARNING: Liked post is not #1. Trending might sort by 0 initially or engagement calc issue.');
            console.log('   - Top Post:', topPost.title, 'Score:', topPost.engagementScore);
        }

        await client.disconnect();

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

async function loginUser(username: string) {
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register
    await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email, username, password, fullName: username,
            examCategory: 'JEE', subjects: ['Math'], targetYear: 2025
        })
    });

    // Login
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error('Login failed');
    const data = (await res.json()) as any;
    console.log('Logged in as', username);
    return data.data.tokens.accessToken;
}

main();
