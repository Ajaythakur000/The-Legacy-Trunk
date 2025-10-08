const express = require('express');
const router = express.Router();
const { 
    createCircle, 
    addMemberToCircle, 
    getMyCircles, 
    removeMemberFromCircle 
} = require('../controllers/circleController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Naya circle banane aur apne saare circles get karne ke liye
router.route('/').post(protect, createCircle).get(protect, getMyCircles);

// Ek circle mein member add karne ke liye
router.route('/:id/members').post(protect, addMemberToCircle);

// Ek circle se member remove karne ke liye
router.route('/:circleId/members/:memberId').delete(protect, removeMemberFromCircle);

module.exports = router;