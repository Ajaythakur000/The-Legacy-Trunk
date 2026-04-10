import { Router } from 'express';
import { getTimelineMilestones } from '../controllers/timelineController.js';
import { protect } from '../middleware/authMiddleware.js'; // Hamara gatekeeper

const router = Router();

// @desc    Get all milestones (Memory Lane) for a specific circle
// @route   GET /api/timeline/:circleId
// @access  Private
// Ye route strictly timeline date ke hisaab se sorted posts dega
router.get('/:circleId', protect, getTimelineMilestones);

export default router;