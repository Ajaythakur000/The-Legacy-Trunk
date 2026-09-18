import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient;

try {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('✅ Upstash Redis Client Initialized');
} catch (error) {
  console.error('❌ Failed to initialize Upstash Redis Client:', error);
}

export default redisClient;
