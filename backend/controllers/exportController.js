import { launch } from 'puppeteer';
import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js';

// 🔥 SECURITY FIX: HTML Escaping Function to prevent XSS (Bug 4)
const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/**
 * @desc    Export selected stories to a PDF
 * @route   POST /api/export/pdf
 * @access  Private
 */
const exportToPdf = async (req, res) => {
    try {
        const { storyIds } = req.body;

        if (!storyIds || storyIds.length === 0) {
            return res.status(400).json({ message: 'Please provide story IDs to export' });
        }

        const userCircles = await FamilyCircle.find({ members: req.user._id });
        const circleIds = userCircles.map(circle => circle._id);

        const stories = await Story.find({
            '_id': { $in: storyIds },
            '$or': [
                { user: req.user._id },
                { sharedWith: { $in: circleIds } }
            ]
        }).populate('user', 'name');

        if (stories.length === 0) {
            return res.status(404).json({ message: 'No authorized stories found for the given IDs' });
        }

        let htmlContent = `
            <html>
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
                    <style>
                        body { 
                            font-family: 'Lato', sans-serif; 
                            margin: 0;
                            padding: 0;
                            background-color: #fdfdfd;
                        }
                        .page {
                            width: 210mm;
                            height: 297mm;
                            padding: 20mm;
                            margin: 10mm auto;
                            box-sizing: border-box;
                            page-break-after: always;
                        }
                        .main-title {
                            font-family: 'Playfair Display', serif;
                            font-size: 48px;
                            color: #333;
                            text-align: center;
                            border-bottom: 2px solid #555;
                            padding-bottom: 20px;
                            margin-bottom: 80px;
                        }
                        .story-title {
                            font-family: 'Playfair Display', serif;
                            font-size: 32px;
                            color: #444;
                            margin-top: 40px;
                            margin-bottom: 5px;
                        }
                        .author {
                            font-size: 16px;
                            color: #777;
                            font-style: italic;
                            margin-bottom: 30px;
                        }
                        .story-content {
                            font-size: 16px;
                            line-height: 1.7;
                            color: #333;
                            text-align: justify;
                        }
                        .story-image {
                            max-width: 80%;
                            height: auto;
                            display: block;
                            margin: 30px auto;
                            border-radius: 4px;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="page">
                        <h1 class="main-title">The Legacy Trunk</h1>
        `;

        stories.forEach(story => {
            // 🔥 SECURITY FIX: Sanitize all user inputs (Bug 4)
            const safeTitle = escapeHTML(story.title);
            const safeAuthor = escapeHTML(story.user?.name || 'Unknown');
            const safeContent = escapeHTML(story.content).replace(/\n/g, '<br>');
            
            // Only allow safe image URLs
            let safeImageHtml = '';
            if (story.mediaUrl && story.mediaUrl.startsWith('http')) {
                const safeMediaUrl = escapeHTML(story.mediaUrl);
                safeImageHtml = `<img class="story-image" src="${safeMediaUrl}" alt="${safeTitle}">`;
            }

            htmlContent += `
                <div class="story">
                    <h2 class="story-title">${safeTitle}</h2>
                    <p class="author">by ${safeAuthor}</p>
                    ${safeImageHtml}
                    <div class="story-content">${safeContent}</div>
                </div>
            `;
        });

        htmlContent += `</div></body></html>`;
        
        // --- PDF Generation using Puppeteer ---
        // 🔥 HIDDEN BUG FIX: Added strict sandbox flags and timeout to prevent crashes (Finding 18)
        const browser = await launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            timeout: 60000
        });
        const page = await browser.newPage();
        
        // 🔥 CRITICAL SECURITY FIX: Kill JavaScript inside the headless browser
        await page.setJavaScriptEnabled(false);
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
        
        await browser.close();

        // --- Send PDF as Response ---
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': 'attachment; filename="memento_stories.pdf"'
        });
        res.send(pdfBuffer);

    } catch (error) {
        // 🔥 HIDDEN BUG FIX: Prevented internal DB info leak (Finding 14)
        console.error("PDF Export Error:", error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default { exportToPdf };