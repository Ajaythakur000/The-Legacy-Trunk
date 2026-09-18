import { Worker } from 'bullmq';
import { redisConnection } from '../config/bullmq.js';
import { launch } from 'puppeteer';
import nodemailer from 'nodemailer';
import Story from '../models/storyModel.js';
import Timeline from '../models/timelineModel.js';
import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';
import dotenv from 'dotenv';
dotenv.config();

const escapeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export const pdfWorker = new Worker('pdf-generation', async (job) => {
    console.log(`[Worker] Started PDF Generation Job ${job.id} for user ${job.data.userId}`);
    const { userId, storyIds } = job.data;

    try {
        const user = await FamilyMember.findById(userId);
        const userCircles = await FamilyCircle.find({ members: userId });
        const circleIds = userCircles.map(c => c._id);

        let stories = [];
        if (job.data.type === 'timeline') {
            stories = await Timeline.find({
                '_id': { $in: storyIds },
                originCircleId: { $in: circleIds }
            }).populate('user', 'name');
        } else {
            stories = await Story.find({
                '_id': { $in: storyIds },
                '$or': [{ user: userId }, { sharedWith: { $in: circleIds } }]
            }).populate('user', 'name');
        }

        if (stories.length === 0) throw new Error("No authorized stories found.");

        let htmlContent = `
            <html><head>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Lato', sans-serif; background-color: #fdfdfd; margin: 0; padding: 0; }
                    .page { width: 210mm; padding: 20mm; margin: 0 auto; page-break-after: always; }
                    .main-title { font-family: 'Playfair Display', serif; font-size: 48px; text-align: center; border-bottom: 2px solid #555; padding-bottom: 20px; margin-bottom: 80px; }
                    .story-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #444; margin-top: 40px; margin-bottom: 5px; }
                    .author { font-size: 16px; color: #777; font-style: italic; margin-bottom: 30px; }
                    .story-content { font-size: 16px; line-height: 1.7; color: #333; text-align: justify; }
                    .story-image { max-width: 80%; height: auto; display: block; margin: 30px auto; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                </style>
            </head><body><div class="page"><h1 class="main-title">The Legacy Trunk</h1>
        `;

        stories.forEach(story => {
            const safeTitle = escapeHTML(story.title);
            const safeAuthor = escapeHTML(story.user?.name || 'Unknown');
            const safeContent = escapeHTML(story.content || story.description || '').replace(/\n/g, '<br>');
            let safeImageHtml = '';
            if (story.mediaUrl && story.mediaUrl.startsWith('http')) {
                safeImageHtml = `<img class="story-image" src="${escapeHTML(story.mediaUrl)}" alt="${safeTitle}">`;
            }
            htmlContent += `<div class="story"><h2 class="story-title">${safeTitle}</h2><p class="author">by ${safeAuthor}</p>${safeImageHtml}<div class="story-content">${safeContent}</div></div>`;
        });
        htmlContent += `</div></body></html>`;
        
        const browser = await launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            timeout: 60000
        });
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(false);
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
        await browser.close();

        console.log(`[Worker] PDF Generated successfully. Sending email to ${user.email}...`);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Family Scrapbook is Ready! 📖',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #4CAF50;">The Legacy Trunk</h2>
                    <p>Hi ${user.name},</p>
                    <p>Your requested Family Scrapbook PDF has been successfully generated in the background!</p>
                    <p>Please find it attached to this email.</p>
                    <br/>
                    <p style="font-size: 12px; color: #888;">This email was sent by your automated background worker 🚀</p>
                </div>
            `,
            attachments: [
                { filename: 'Family_Scrapbook.pdf', content: pdfBuffer }
            ]
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
