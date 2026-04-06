import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getFamilyMessages, uploadChatMedia } from '../controllers/messageController.js';
// 🔥 IMPORT YOUR UPLOAD MIDDLEWARE (Adjust path if needed)
import upload from '../middleware/uploadMiddleware.js'; 

const router = Router();

/**
 * GET /api/messages/:familyCircleId?limit=50
 */
router.get('/:familyCircleId', protect, getFamilyMessages);

/**
 * POST /api/messages/upload
 * 🔥 NEW: Upload media file to Cloudinary
 */
router.post('/upload', protect, upload.single('media'), uploadChatMedia);

export default router;