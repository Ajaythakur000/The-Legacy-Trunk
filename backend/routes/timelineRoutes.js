import { Router } from 'express';
const router = Router();

import {
  createTimelineEvent,
  getMyFamilyTimeline,
  getGlobalTimeline,
  getTimelineEventById,
  updateTimelineEvent,
  deleteTimelineEvent,
} from '../controllers/timelineController.js';

import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Create new timeline event
router.route('/').post(protect, upload.single('media'), createTimelineEvent);

// Family timeline feed
router.route('/my-family').get(protect, getMyFamilyTimeline);

// Global timeline feed
router.route('/global').get(protect, getGlobalTimeline);

// Single event operations
router
  .route('/:id')
  .get(protect, getTimelineEventById)
  .put(protect, updateTimelineEvent)
  .delete(protect, deleteTimelineEvent);

export default router;