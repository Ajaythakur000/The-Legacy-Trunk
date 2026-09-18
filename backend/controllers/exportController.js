import { pdfQueue } from '../config/bullmq.js';
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
        if (!storyIds || storyIds.length === 0) return res.status(400).json({ message: 'Please provide story IDs to export' });
        
        const job = await pdfQueue.add('generate-scrapbook', { userId: req.user._id, storyIds: storyIds });
        console.log('[Queue] Job ' + job.id + ' added for User ' + req.user._id);
        
        return res.status(200).json({ message: 'Your PDF is generating in the background! We will email it to you shortly.' });
    } catch (error) {
        console.error("Queue Error:", error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default { exportToPdf };