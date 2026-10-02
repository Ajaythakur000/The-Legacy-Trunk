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

// Handles creating and fetching circles
router.route('/').post(protect, createCircle).get(protect, getMyCircles);

// Fetches the leaderboard
router.route('/leaderboard').get(protect, getLeaderboard);

// Joins a circle via invite link
router.route('/join-invite').post(protect, joinViaInvite);

// Fetches the top contributor for a circle
router.route('/:id/top-contributor').get(protect, getTopContributor);

// Fetches upcoming events for a circle
router.route('/:id/upcoming-events').get(protect, getUpcomingEvents);

// Generates an invite link for a circle
router.route('/:id/invite-link').post(protect, generateInviteLink);

// Handles fetching and deleting a specific circle
router.route('/:id').get(protect, getCircleById).delete(protect, deleteCircle);

// Sends a family invite to a circle
router.route('/:id/members').post(protect, sendFamilyInvite);

// Removes a member from a circle
router.route('/:circleId/members/:memberId').delete(protect, removeMemberFromCircle);

export default router;