import { notificationQueue } from '../queue-client';

export const addPushNotificationJob = async (data: { userId: string; title: string; body: string }) => {
    await notificationQueue.add('sendPushNotification', data, { attempts: 3 });
};

export const addStreakReminderJob = async (data: { userId: string; currentStreak: number }) => {
    await notificationQueue.add('sendStreakReminder', data, { attempts: 2 });
};

export const addAchievementUnlockedJob = async (data: { userId: string; achievement: string }) => {
    await notificationQueue.add('sendAchievementUnlocked', data, { attempts: 3 });
};
