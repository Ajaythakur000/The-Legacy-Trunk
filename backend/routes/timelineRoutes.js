import { Router } from 'express';
import { getTimelineMilestones } from '../controllers/timelineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Fetches timeline milestones for a circle
router.get('/:circleId', protect, getTimelineMilestones);

export default router;