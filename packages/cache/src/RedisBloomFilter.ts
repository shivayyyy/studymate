
import { createClient } from 'redis';
import murmurhash from 'murmurhash';
import { getRedisClient, connectRedis } from './redis-client';

export class RedisBloomFilter {
    private key: string;
    private size: number; // m: number of bits
    private hashCount: number; // k: number of hash functions

    /**
     * @param key Redis key for the bitset
     * @param errorRate Desired error rate (e.g. 0.0001 for 0.01%)
     * @param capacity Expected number of items (n)
     */
    constructor(key: string, errorRate: number, capacity: number) {
        this.key = key;
        // m = -(n * ln(p)) / (ln(2)^2)
        this.size = Math.ceil(-(capacity * Math.log(errorRate)) / (Math.pow(Math.log(2), 2)));
        // k = (m/n) * ln(2)
        this.hashCount = Math.round((this.size / capacity) * Math.log(2));

        console.log(`[BloomFilter] Initialized ${key}: Size=${this.size} bits, Hashes=${this.hashCount}, Capacity=${capacity}, ErrorRate=${errorRate}`);
    }

    private getHashValues(item: string): number[] {
        const hash1 = murmurhash.v3(item, 0);
        const hash2 = murmurhash.v3(item, hash1); // Use hash1 as seed for second hash to simulate double hashing

        // Double Hashing: h(i) = (h1 + i * h2) % m
        const positions: number[] = [];
        for (let i = 0; i < this.hashCount; i++) {
            const pos = (hash1 + i * hash2) % this.size;
            positions.push(Math.abs(pos)); // Ensure positive index
        }
        return positions;
    }

    async add(item: string): Promise<void> {
        const client = await connectRedis();
        const positions = this.getHashValues(item);

        const pipeline = client.multi();
        for (const pos of positions) {
            pipeline.setBit(this.key, pos, 1);
        }
        await pipeline.exec();
    }

    async exists(item: string): Promise<boolean> {
        const client = await connectRedis();
        const positions = this.getHashValues(item);

        // We can pipeline GETBITs
        const pipeline = client.multi();
        for (const pos of positions) {
            pipeline.getBit(this.key, pos);
        }
        const results = await pipeline.exec();

        if (!results) return false;

        // If any bit is 0, the item is definitely NOT in the set
        // results is array of [error, result] or just results depending on client version, 
        // usually with v4 it throws on error or returns array of results.
        // Wait, v4 .exec() returns array of results.

        for (const res of results) {
            if (res === 0) return false;
        }

        return true; // Probably in the set
    }

    /**
     * Initialize/Reserve is technically just defining the parameters in code for standard Redis Bitsets,
     * but we can ensure the key isn't something else.
     */
    async reserve(): Promise<void> {
        // No-op for bitsets, handled by usage. 
        // We could delete existing key if we wanted to start fresh, 
        // but typically reserve implies ensuring it exists or allocating.
        // Redis allocates bitsets dynamically.
    }
}
