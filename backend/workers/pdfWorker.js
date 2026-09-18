import { Worker } from 'bullmq';
import { redisConnection } from '../config/bullmq.js';
import FamilyMember from '../models/familyMember.js';
import dotenv from 'dotenv';
dotenv.config();

export const pdfWorker = new Worker('pdf-generation', async (job) => {
    console.log(`[Worker] Started Async Email Job ${job.id} for user ${job.data.userId}`);
    const { userId } = job.data;

    try {
        const user = await FamilyMember.findById(userId);

        console.log(`[Worker] Sending email to ${user.email} using Brevo API...`);

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #4CAF50;">The Legacy Trunk</h2>
                <p>Hi ${user.name},</p>
                <p>Congratulations! Your Family Scrapbook was successfully generated and downloaded.</p>
                <p>This automated email was decoupled from the main server and dispatched asynchronously using our <strong>Redis Message Queue (BullMQ)</strong>!</p>
                <br/>
                <p style="font-size: 12px; color: #888;">Resume points secured 🚀</p>
            </div>
        `;

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
                to: [{ email: user.email }],
                subject: 'Memories Successfully Exported! 🎉',
                htmlContent: htmlContent
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("[Worker] Brevo API Error:", result);
            throw new Error(result.message || "Failed to send email via Brevo");
        }

        console.log(`[Worker] Email sent to ${user.email} successfully!`);

    } catch (err) {
        console.error(`[Worker] Job ${job.id} failed:`, err.message);
        throw err;
    }
}, { connection: redisConnection });

pdfWorker.on('completed', (job) => console.log(`[Worker] Job ${job.id} has completed!`));
pdfWorker.on('failed', (job, err) => console.error(`[Worker] Job ${job.id} has failed with ${err.message}`));
