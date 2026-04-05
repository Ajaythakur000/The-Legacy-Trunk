import express from 'express';
import { askOracle } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js'; // Make sure your auth path is correct

const router = express.Router();

// Route: POST /api/ai/ask-oracle
router.post('/ask-oracle', protect, askOracle);

export default router;