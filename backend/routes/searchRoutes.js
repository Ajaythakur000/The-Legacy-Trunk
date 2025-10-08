const express = require('express');
const router = express.Router();
const { searchContent } = require('../controllers/searchController.js');
const { protect } = require('../middleware/authMiddleware.js');

// /api/search
// Search ka route protected hai
router.route('/').get(protect, searchContent);

module.exports = router;