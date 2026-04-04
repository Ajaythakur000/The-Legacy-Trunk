import { Router } from 'express';
const router = Router();
import { getTimelineMilestones } from '../controllers/timelineController.js';
import { protect } from '../middleware/authMiddleware.js';

// GET /api/timeline/:circleId
// Ye route strictly timeline date ke hisaab se sorted posts dega
router.get('/:circleId', protect, getTimelineMilestones);

export default router;