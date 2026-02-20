
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../apps/api/.env') });
import { createClient } from 'redis';

async function testBloom() {
    console.log('Using Redis URL:', process.env.REDIS_URL?.substring(0, 20) + '...');
    const client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();
    console.log('Connected to Redis');

    try {
        // Try to create a Bloom Filter
        // The command might be bf.reserve or strictly BF.RESERVE depending on client mapping, 
        // but recent redis client maps commands dynamically or via .bf property if modules detected?
        // Let's try raw command execution if possible or standard method if types exist.
        // Node redis v4 usually exposes modules under .bf or similar or generic .sendCommand

        console.log('Attempting BF.RESERVE...');
        try {
            await client.sendCommand(['BF.RESERVE', 'test_bloom', '0.01', '1000']);
            console.log('BF.RESERVE success');
        } catch (e: any) {
            console.log('BF.RESERVE failed:', e.message);
            if (e.message.includes('ERR unknown command')) {
                console.error('Bloom Filter module NOT loaded in Redis');
                process.exit(1);
            }
        }

        console.log('Attempting BF.ADD...');
        await client.sendCommand(['BF.ADD', 'test_bloom', 'user1']);

        console.log('Attempting BF.EXISTS...');
        const exists = await client.sendCommand(['BF.EXISTS', 'test_bloom', 'user1']);
        console.log('BF.EXISTS user1:', exists);

        // Cleanup
        await client.del('test_bloom');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await client.disconnect();
    }
}

testBloom();
