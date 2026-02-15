import { Queue, type ConnectionOptions } from 'bullmq';

const getRedisConnection = (): ConnectionOptions => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
});

export const emailQueue = new Queue('email', { connection: getRedisConnection() });
export const notificationQueue = new Queue('notification', { connection: getRedisConnection() });
export const analyticsQueue = new Queue('analytics', { connection: getRedisConnection() });
export const fileProcessingQueue = new Queue('file-processing', { connection: getRedisConnection() });

export { getRedisConnection };
