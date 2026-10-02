import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead, acceptInvite, rejectInvite } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

// Fetches my notifications
router.route('/').get(getMyNotifications);

// Marks all notifications as read
router.route('/mark-all-read').put(markAllAsRead);

// Marks a single notification as read
router.route('/:id/read').put(markAsRead);

// Accepts an invite
router.route('/:id/accept').post(acceptInvite);

// Rejects an invite
router.route('/:id/reject').post(rejectInvite);

export default router;