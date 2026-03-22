import { Router } from 'express';
import circleController from '../controllers/circleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const {
  createCircle,
  addMemberToCircle,
  getMyCircles,
  getCircleById,
  removeMemberFromCircle,
} = circleController;

router.route('/').post(protect, createCircle).get(protect, getMyCircles);
router.route('/:id').get(protect, getCircleById);
router.route('/:id/members').post(protect, addMemberToCircle);
router.route('/:circleId/members/:memberId').delete(protect, removeMemberFromCircle);

export default router;