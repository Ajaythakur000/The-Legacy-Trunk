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
  getLeaderboard,
  getTopContributor, // 🔥 Naya function import kar liya
} = circleController;

// GET /api/circles
// POST /api/circles
router.route('/').post(protect, createCircle).get(protect, getMyCircles);

// 🔥 IMPORTANT: '/leaderboard' ko '/:id' se UPAR rakhna zaroori hai!
// GET /api/circles/leaderboard
router.route('/leaderboard').get(protect, getLeaderboard);

// 🔥 NEW: Top Contributor Route
// GET /api/circles/:id/top-contributor
router.route('/:id/top-contributor').get(protect, getTopContributor);

// GET /api/circles/:id
router.route('/:id').get(protect, getCircleById);

// POST /api/circles/:id/members
router.route('/:id/members').post(protect, addMemberToCircle);

// DELETE /api/circles/:circleId/members/:memberId
router.route('/:circleId/members/:memberId').delete(protect, removeMemberFromCircle);

export default router;