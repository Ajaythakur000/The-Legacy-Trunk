import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getFamilyMessages, uploadChatMedia } from '../controllers/messageController.js';
import upload from '../middleware/uploadMiddleware.js'; 

const router = Router();

// Fetches family messages
router.get('/:familyCircleId', protect, getFamilyMessages);

// Uploads a chat media file
router.post('/upload', protect, upload.single('media'), uploadChatMedia);

export default router;