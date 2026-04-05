import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth middleware to all notification routes
router.use(protect);

router.route('/').get(getMyNotifications);
router.route('/mark-all-read').put(markAllAsRead);
router.route('/:id/read').put(markAsRead);

export default router;