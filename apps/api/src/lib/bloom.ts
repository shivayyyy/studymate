
import { RedisBloomFilter } from '@studymate/cache';

// Initialize with 0.01% error rate for 1 million users
// Key: 'usernames'
export const usernameBloomFilter = new RedisBloomFilter('usernames', 0.0001, 1000000);
