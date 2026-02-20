import { createClient, type RedisClientType } from 'redis';

let redisClient: RedisClientType;
let isConnected = false;

export const getRedisClient = (): RedisClientType => {
    if (!redisClient) {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries: number) => Math.min(retries * 50, 500),
            },
        });

        redisClient.on('error', (err) => console.error('Redis Client Error:', err));
        redisClient.on('connect', () => {
            isConnected = true;
            console.log('Redis Client Connected');
        });
        redisClient.on('disconnect', () => {
            isConnected = false;
            console.warn('Redis Client Disconnected');
        });
    }
    return redisClient;
};

export const connectRedis = async (): Promise<RedisClientType> => {
    const client = getRedisClient();
    if (!isConnected) {
        await client.connect();
    }
    return client;
};

export const disconnectRedis = async (): Promise<void> => {
    if (redisClient && isConnected) {
        await redisClient.disconnect();
        isConnected = false;
    }
};

export const sendCommand = async (command: string[]): Promise<any> => {
    const client = await connectRedis();
    return client.sendCommand(command);
};

export { redisClient };
