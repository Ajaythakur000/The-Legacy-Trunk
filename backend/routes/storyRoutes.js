import { Router } from 'express';
import {
  createStory,
  getMyFamilyStories,
  getGlobalStories,
  getCircleFeed, // add
  getStoryById,
  updateStory,
  deleteStory,
  toggleLikeStory,
  addCommentToStory,
} from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

// Create story
router.route('/').post(protect, upload.single('media'), createStory);

// NEW: Active circle feed
router.route('/feed').get(protect, getCircleFeed);

// Existing endpoints
router.route('/my-family').get(protect, getMyFamilyStories);
router.route('/global').get(protect, getGlobalStories);
router.route('/:id/like').put(protect, toggleLikeStory);
router.route('/:id/comments').post(protect, addCommentToStory);
router.route('/:id').get(protect, getStoryById).put(protect, updateStory).delete(protect, deleteStory);

export default router;