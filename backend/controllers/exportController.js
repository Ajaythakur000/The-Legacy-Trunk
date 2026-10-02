import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js';

// Escapes problematic characters in HTML strings to prevent cross-site scripting
const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// Logs a request to export stories or items to a PDF format
const exportToPdf = async (req, res) => {
    try {
        const { storyIds, items, type = 'story' } = req.body;
        if ((!storyIds || storyIds.length === 0) && (!items || items.length === 0)) return res.status(400).json({ message: 'Please provide items to export' });
        
        return res.status(200).json({ message: 'Export logged successfully!' });
    } catch (error) {
        console.error("Export Error:", error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default { exportToPdf };