
import { Router } from 'express';
const router = Router();
import circleController from '../controllers/circleController.js';
const {
    createCircle, addMemberToCircle, getMyCircles, removeMemberFromCircle
} = circleController;

import { protect } from '../middleware/authMiddleware.js'; // Assuming authMiddleware exports an object with protect

// Naya circle banane aur apne saare circles get karne ke liye
router.route('/').post(protect, createCircle).get(protect, getMyCircles);

// Ek circle mein member add karne ke liye
router.route('/:id/members').post(protect, addMemberToCircle);

// Ek circle se member remove karne ke liye
router.route('/:circleId/members/:memberId').delete(protect, removeMemberFromCircle);

export default router;