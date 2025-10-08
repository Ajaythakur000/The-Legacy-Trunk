const express = require('express');
const router = express.Router();
// Controller se naya function import karna
const { 
    createStory, 
    getMyStories, 
    getStoryById, 
    updateStory, 
    deleteStory,
    shareStoryWithCircle // Naya function import kiya
} = require('../controllers/storyController.js');
const { protect } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

router.route('/').post(protect, upload.single('media'), createStory).get(protect, getMyStories);

// GET aur PUT dono ke liye same route hai, bas method alag hai ..same with update..
// Humne yahan .put() method ko chain kar diya hai..idhr ...delete story chain kr diii hai....
router.route('/:id').get(protect, getStoryById).put(protect, updateStory).delete(protect, deleteStory);

// Naya route story ko share karne ke liye
router.route('/:id/share').put(protect, shareStoryWithCircle);


module.exports = router;