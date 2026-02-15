import { addPushNotificationJob, addStreakReminderJob, addAchievementUnlockedJob, addWelcomeEmailJob } from '@studymate/queue';

export class NotificationService {
    static async sendWelcomeEmail(data: { email: string; fullName: string }) {
        await addWelcomeEmailJob(data);
    }

    static async sendPushNotification(userId: string, title: string, body: string) {
        await addPushNotificationJob({ userId, title, body });
    }

    static async sendStreakReminder(userId: string, currentStreak: number) {
        await addStreakReminderJob({ userId, currentStreak });
    }

    static async sendAchievementUnlocked(userId: string, achievement: string) {
        await addAchievementUnlockedJob({ userId, achievement });
    }
}

export default NotificationService;
