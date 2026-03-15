import { Router } from 'express';
const router = Router();
import exportController from '../controllers/exportController.js';
const { exportToPdf } = exportController;
import { protect } from '../middleware/authMiddleware.js';

// POST /api/export/pdf - Protected route to generate and download a PDF of selected stories.
router.route('/pdf').post(protect, exportToPdf);

export default router;