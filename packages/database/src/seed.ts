import { connectDB } from './connection';
import { User, Room } from './models';

const seedDatabase = async () => {
    await connectDB();

    console.log('🌱 Seeding database...');

    // Seed default rooms
    const rooms = [
        { name: 'JEE Physics Lab', examCategory: 'JEE', subject: 'Physics', timerMode: 'POMODORO_25_5' },
        { name: 'JEE Chemistry Hub', examCategory: 'JEE', subject: 'Chemistry', timerMode: 'POMODORO_25_5' },
        { name: 'JEE Maths Arena', examCategory: 'JEE', subject: 'Mathematics', timerMode: 'EXTENDED_45_10' },
        { name: 'NEET Biology Zone', examCategory: 'NEET', subject: 'Biology', timerMode: 'POMODORO_25_5' },
        { name: 'NEET Chemistry Room', examCategory: 'NEET', subject: 'Chemistry', timerMode: 'POMODORO_25_5' },
        { name: 'UPSC GS Study Hall', examCategory: 'UPSC', subject: 'General Studies', timerMode: 'LONG_90_20' },
        { name: 'UPSC History Room', examCategory: 'UPSC', subject: 'History', timerMode: 'EXTENDED_45_10' },
        { name: 'GATE CS Lab', examCategory: 'GATE', subject: 'Computer Science', timerMode: 'POMODORO_25_5' },
        { name: 'GATE ECE Room', examCategory: 'GATE', subject: 'Electronics', timerMode: 'EXTENDED_45_10' },
    ] as const;

    for (const room of rooms) {
        await Room.findOneAndUpdate(
            { name: room.name },
            { $setOnInsert: room },
            { upsert: true, new: true },
        );
    }

    console.log(`✅ Seeded ${rooms.length} rooms`);
    process.exit(0);
};

seedDatabase().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
