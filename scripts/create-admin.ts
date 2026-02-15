/**
 * Create admin user script
 * Run: bun run create-admin
 */

import { connectDB, User } from '@studymate/database';
import { hashPassword } from '@studymate/auth';

const createAdmin = async () => {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@studymate.com';
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123!';

    const existing = await User.findOne({ email });
    if (existing) {
        console.log('Admin user already exists');
        process.exit(0);
    }

    const passwordHash = await hashPassword(password);

    await User.create({
        email,
        username,
        passwordHash,
        fullName: 'Admin User',
        examCategory: 'JEE',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        targetYear: 2025,
        isVerified: true,
    });

    console.log(`✅ Admin user created: ${email}`);
    process.exit(0);
};

createAdmin().catch((err) => {
    console.error('❌ Failed to create admin:', err);
    process.exit(1);
});
