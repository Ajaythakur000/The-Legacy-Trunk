import { Router } from 'express';
import {
  createStory,
  getMyFamilyStories,
  getGlobalStories,
  getStoryById,
  updateStory,
  deleteStory,
  toggleLikeStory,
  addCommentToStory,
} from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();


// 1. Create a new story (with media upload)
router.route('/').post(protect, upload.single('media'), createStory);

// 2. Fetch User's Private Family Vault Stories
router.route('/my-family').get(protect, getMyFamilyStories);

// 3. Fetch Global Explore Feed Stories
router.route('/global').get(protect, getGlobalStories);

// 4. Social actions
router.route('/:id/like').put(protect, toggleLikeStory);
router.route('/:id/comments').post(protect, addCommentToStory);

// 5. Single story operations (GET, PUT, DELETE chained together)
router
  .route('/:id')
  .get(protect, getStoryById)
  .put(protect, updateStory)
  .delete(protect, deleteStory);
export default router;