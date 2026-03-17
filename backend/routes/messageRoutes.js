import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getFamilyMessages } from '../controllers/messageController.js';

const router = Router();

/**
 * GET /api/messages/:familyCircleId?limit=50
 * Example: /api/messages/67f1ab12cd34ef56ab78cd90?limit=30
 */
router.get('/:familyCircleId', protect, getFamilyMessages);

export default router;