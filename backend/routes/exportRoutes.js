const express = require('express');
const router = express.Router();
const { exportToPdf } = require('../controllers/exportController.js');
const { protect } = require('../middleware/authMiddleware.js');

// POST /api/export/pdf - Protected route to generate and download a PDF of selected stories.
router.route('/pdf').post(protect, exportToPdf);

module.exports = router;