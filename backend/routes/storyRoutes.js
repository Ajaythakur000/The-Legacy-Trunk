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
  getMyStories 
} from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

// Handles uploading media files for a story
const uploadStoryMedia = (req, res, next) => {
  upload.array('media', 5)(req, res, (err) => {
    if (err) {
      console.error('❌ uploadStoryMedia error:', err);
      return res.status(400).json({
        message: err.message || 'Media upload failed (Max 5 files allowed)',
        code: err.code || 'UPLOAD_ERROR',
        name: err.name || 'UploadError',
      });
    }
    next();
  });
};

// Creates a new story
router.route('/').post(protect, uploadStoryMedia, createStory);

// Fetches the active circle feed
router.route('/feed').get(protect, getCircleFeed);

// Fetches my family stories
router.route('/my-family').get(protect, getMyFamilyStories);

// Fetches global stories
router.route('/global').get(protect, getGlobalStories);

// Fetches my stories
router.route('/mine').get(protect, getMyStories);

// Toggles like on a story
router.route('/:id/like').put(protect, toggleLikeStory);

// Adds a comment to a story
router.route('/:id/comments').post(protect, addCommentToStory);

// Handles fetching, updating, and deleting a story by ID
router.route('/:id')
  .get(protect, getStoryById)
  .put(protect, updateStory)
  .delete(protect, deleteStory);

export default router;