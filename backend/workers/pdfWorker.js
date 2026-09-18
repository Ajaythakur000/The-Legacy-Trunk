import { Worker } from 'bullmq';
import { redisConnection } from '../config/bullmq.js';
import nodemailer from 'nodemailer';
import FamilyMember from '../models/familyMember.js';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export const pdfWorker = new Worker('pdf-generation', async (job) => {
    console.log(`[Worker] Started Async Email Job ${job.id} for user ${job.data.userId}`);
    const { userId } = job.data;

    try {
        const user = await FamilyMember.findById(userId);

        console.log(`[Worker] Sending email to ${user.email} using Nodemailer...`);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Memories Successfully Exported! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #4CAF50;">The Legacy Trunk</h2>
                    <p>Hi ${user.name},</p>
                    <p>Congratulations! Your Family Scrapbook was successfully generated and downloaded.</p>
                    <p>This automated email was decoupled from the main server and dispatched asynchronously using our <strong>Redis Message Queue (BullMQ)</strong>!</p>
                    <br/>
                    <p style="font-size: 12px; color: #888;">Resume points secured 🚀</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Worker] Email sent to ${user.email} successfully!`);

    } catch (err) {
        console.error(`[Worker] Job ${job.id} failed:`, err);
        throw err;
    }
}, { connection: redisConnection });

pdfWorker.on('completed', (job) => console.log(`[Worker] Job ${job.id} has completed!`));
pdfWorker.on('failed', (job, err) => console.error(`[Worker] Job ${job.id} has failed with ${err.message}`));
