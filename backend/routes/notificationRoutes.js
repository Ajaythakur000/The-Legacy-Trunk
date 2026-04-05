import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead, acceptInvite, rejectInvite } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth middleware to all notification routes
router.use(protect);

router.route('/').get(getMyNotifications);
router.route('/mark-all-read').put(markAllAsRead);
router.route('/:id/read').put(markAsRead);

// 🔥 NEW: Accept / Reject Invite Routes
router.route('/:id/accept').post(acceptInvite);
router.route('/:id/reject').post(rejectInvite);

export default router;