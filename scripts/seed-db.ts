/**
 * Seed database script
 * Run: bun run seed
 */

import { connectDB } from '@studymate/database';

const seed = async () => {
    await connectDB();
    // Import and run the database seed
    await import('@studymate/database/src/seed');
};

seed().catch(console.error);
