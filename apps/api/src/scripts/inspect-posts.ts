import { connectDB, Post } from '@studymate/database';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function inspectPosts() {
    await connectDB(process.env.MONGODB_URI!);

    const total = await Post.countDocuments({ isActive: true });
    const sample = await Post.find({ isActive: true }).limit(5).lean();

    console.log('Total active posts:', total);
    console.log('\nSample posts:');
    sample.forEach(p => {
        console.log({
            id: p._id.toString(),
            authorUsername: (p as any).authorUsername,
            authorName: (p as any).authorName,
            userId: p.userId?.toString(),
            examCategory: p.examCategory,
            subject: p.subject,
        });
    });

    process.exit(0);
}

inspectPosts().catch(err => { console.error(err); process.exit(1); });
