import { emailQueue } from '../queue-client';

export const addWelcomeEmailJob = async (data: { email: string; fullName: string }) => {
    await emailQueue.add('sendWelcomeEmail', data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
};

export const addPasswordResetJob = async (data: { email: string; resetToken: string }) => {
    await emailQueue.add('sendPasswordReset', data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
};

export const addWeeklyDigestJob = async (data: { userId: string; email: string }) => {
    await emailQueue.add('sendWeeklyDigest', data, { attempts: 2 });
};
