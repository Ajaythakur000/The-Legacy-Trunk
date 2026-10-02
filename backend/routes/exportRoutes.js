import { Router } from 'express';
const router = Router();
import exportController from '../controllers/exportController.js';
const { exportToPdf } = exportController;
import { protect } from '../middleware/authMiddleware.js';

// Exports stories to a PDF file
router.route('/pdf').post(protect, exportToPdf);

export default router;