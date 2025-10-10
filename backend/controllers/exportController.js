const puppeteer = require('puppeteer');
const Story = require('../models/storyModel.js');
const FamilyCircle = require('../models/familyCircleModel.js');

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

        // --- NAYA AUR IMPROVED HTML/CSS ---
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
            htmlContent += `
                <div class="story">
                    <h2 class="story-title">${story.title}</h2>
                    <p class="author">by ${story.user.name}</p>
                    ${story.mediaUrl ? `<img class="story-image" src="${story.mediaUrl}" alt="${story.title}">` : ''}
                    <div class="story-content">${story.content.replace(/\n/g, '<br>')}</div>
                </div>
            `;
        });

        htmlContent += `</div></body></html>`;
        
        // --- PDF Generation using Puppeteer ---
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
        
        await browser.close();

        // --- Send PDF as Response ---
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': 'attachment; filename="legacy_trunk_stories.pdf"'
        });
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = { exportToPdf };