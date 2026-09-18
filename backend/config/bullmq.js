import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

const redisConnection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: { rejectUnauthorized: false }
});

redisConnection.on('error', (err) => {
    console.error('BullMQ Redis Connection Error:', err);
});

export const pdfQueue = new Queue('pdf-generation', { 
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
    }
});

export { redisConnection };


export const otpQueue = new Queue('otp-email-dispatch', { 
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
    }
});