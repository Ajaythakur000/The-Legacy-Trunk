import { Router } from 'express';
import circleController from '../controllers/circleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const {
  createCircle,
  sendFamilyInvite,
  getMyCircles,
  getCircleById,
  removeMemberFromCircle,
  getLeaderboard,
  getTopContributor,
  getUpcomingEvents,
  generateInviteLink,
  joinViaInvite,
  deleteCircle,
} = circleController;

// GET /api/circles
// POST /api/circles
router.route('/').post(protect, createCircle).get(protect, getMyCircles);

// specific routes must be above /:id
router.route('/leaderboard').get(protect, getLeaderboard);
router.route('/join-invite').post(protect, joinViaInvite);
router.route('/:id/top-contributor').get(protect, getTopContributor);
router.route('/:id/upcoming-events').get(protect, getUpcomingEvents);
router.route('/:id/invite-link').post(protect, generateInviteLink);

// GET /api/circles/:id
// DELETE /api/circles/:id
router.route('/:id').get(protect, getCircleById).delete(protect, deleteCircle);

// POST /api/circles/:id/members
router.route('/:id/members').post(protect, sendFamilyInvite);

// DELETE /api/circles/:circleId/members/:memberId
router.route('/:circleId/members/:memberId').delete(protect, removeMemberFromCircle);

export default router;