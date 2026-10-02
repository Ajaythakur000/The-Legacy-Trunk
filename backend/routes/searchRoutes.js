import { Router } from 'express';
const router = Router();
import { searchContent } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';

// Searches content
router.route('/').get(protect, searchContent);

export default router;