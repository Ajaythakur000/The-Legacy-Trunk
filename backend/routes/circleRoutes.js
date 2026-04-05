import { Router } from 'express';
import circleController from '../controllers/circleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const {
  createCircle,
  sendFamilyInvite, // 🔥 Yahan theek kar diya (Pehle addMemberToCircle tha)
  getMyCircles,
  getCircleById,
  removeMemberFromCircle,
  getLeaderboard,
  getTopContributor,
  getUpcomingEvents,
  generateInviteLink,
  joinViaInvite
} = circleController;

// GET /api/circles
// POST /api/circles
router.route('/').post(protect, createCircle).get(protect, getMyCircles);

// 🔥 IMPORTANT: specific text routes MUST be ABOVE /:id routes!
// GET /api/circles/leaderboard
router.route('/leaderboard').get(protect, getLeaderboard);

// POST /api/circles/join-invite
router.route('/join-invite').post(protect, joinViaInvite);

// GET /api/circles/:id/top-contributor
router.route('/:id/top-contributor').get(protect, getTopContributor);

// GET /api/circles/:id/upcoming-events
router.route('/:id/upcoming-events').get(protect, getUpcomingEvents);

// POST /api/circles/:id/invite-link
router.route('/:id/invite-link').post(protect, generateInviteLink);

// GET /api/circles/:id
router.route('/:id').get(protect, getCircleById);

// POST /api/circles/:id/members (Ab ye direct add nahi, invite bhejega)
router.route('/:id/members').post(protect, sendFamilyInvite); // 🔥 Yahan handler update kar diya

// DELETE /api/circles/:circleId/members/:memberId
router.route('/:circleId/members/:memberId').delete(protect, removeMemberFromCircle);

export default router;