const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { createTimeline, getMyTimelines, addEventToTimeline, getTimelineById } = require('../controllers/timelineController.js');
const { protect } = require('../middleware/authMiddleware.js'); // Hamara gatekeeper
=======

const {
  createTimelineEvent,
  getMyFamilyTimeline,
  getGlobalTimeline,
  getTimelineEventById,
  updateTimelineEvent,
  deleteTimelineEvent,
} = require('../controllers/timelineController.js');
>>>>>>> cf9119e (4.feat(timeline): refactor to family-vault event model with chronological feeds and CRUD)

const { protect } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

// Create new timeline event
router.route('/').post(protect, upload.single('media'), createTimelineEvent);

<<<<<<< HEAD
=======
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
>>>>>>> cf9119e (4.feat(timeline): refactor to family-vault event model with chronological feeds and CRUD)

module.exports = router;