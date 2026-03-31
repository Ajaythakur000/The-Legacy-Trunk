import { Router } from 'express';
import {
  createStory,
  getMyFamilyStories,
  getGlobalStories,
  getCircleFeed,
  getStoryById,
  updateStory,
  deleteStory,
  toggleLikeStory,
  addCommentToStory,
} from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

const uploadStoryMedia = (req, res, next) => {
  upload.single('media')(req, res, (err) => {
    if (err) {
      console.error('❌ uploadStoryMedia error:', err); // <-- add
      return res.status(400).json({
        message: err.message || 'Media upload failed',
        code: err.code || 'UPLOAD_ERROR',
        name: err.name || 'UploadError',
      });
    }
    next();
  });
};

// Create story
router.route('/').post(protect, uploadStoryMedia, createStory);

// Active circle feed
router.route('/feed').get(protect, getCircleFeed);

// Existing endpoints
router.route('/my-family').get(protect, getMyFamilyStories);
router.route('/global').get(protect, getGlobalStories);
router.route('/:id/like').put(protect, toggleLikeStory);
router.route('/:id/comments').post(protect, addCommentToStory);
router.route('/:id').get(protect, getStoryById).put(protect, updateStory).delete(protect, deleteStory);

export default router;