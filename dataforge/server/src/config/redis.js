import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redis = null;

function getClient() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 50, 1000);
      },
    });
    redis.on('connect', () => console.log('[Redis] Connected'));
    redis.on('error', () => {});
  }
  return redis;
}

export const connectRedis = async () => {
  try {
    const client = getClient();
    await client.ping();
    console.log('[Redis] Connection verified');
  } catch (error) {
    console.warn('[Redis] Connection failed (non-fatal):', error.message);
  }
};

export default redis;
