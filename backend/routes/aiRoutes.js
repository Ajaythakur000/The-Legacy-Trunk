import express from 'express';
import { askOracle, enhanceStory, generateTitle } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔮 Oracle Route
router.post('/ask-oracle', protect, askOracle);

// ✨ AI Copilot Routes
router.post('/enhance-story', protect, enhanceStory);
router.post('/generate-title', protect, generateTitle);

export default router;