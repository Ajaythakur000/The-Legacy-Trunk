import express from 'express';
import { askOracle, enhanceStory, generateTitle } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Asks the AI oracle a question
router.post('/ask-oracle', protect, askOracle);

// Enhances a story using AI
router.post('/enhance-story', protect, enhanceStory);

// Generates a title using AI
router.post('/generate-title', protect, generateTitle);

export default router;