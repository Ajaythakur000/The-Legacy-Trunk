import { Worker } from 'bullmq';
import { redisConnection } from '../config/bullmq.js';
import dotenv from 'dotenv';
dotenv.config();

export const otpWorker = new Worker('otp-email-dispatch', async (job) => {
    console.log(`[Worker] Started OTP Async Email Job ${job.id} to ${job.data.to}`);
    const { to, subject, otpHtml } = job.data;

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "The Legacy Trunk",
                    email: process.env.EMAIL_USER
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: otpHtml
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("[OTP Worker] Brevo API Error:", result);
            throw new Error(result.message || "Failed to send email via Brevo");
        }

        console.log(`[Worker] OTP Email sent asynchronously to ${to}!`);
    } catch (err) {
        console.error(`[Worker] Job ${job.id} failed:`, err.message);
        throw err;
    }
}, { connection: redisConnection });

otpWorker.on('completed', (job) => console.log(`[Worker] OTP Job ${job.id} completed!`));
otpWorker.on('failed', (job, err) => console.error(`[Worker] OTP Job ${job.id} failed with ${err.message}`));
