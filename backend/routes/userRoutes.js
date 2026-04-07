import { Router } from 'express';

import { registerUser, verifyOTP, loginUser, getUserProfile, updateUserProfile } from '../controllers/userController.js'; 
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; 

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP); // 🔥 OTP Verify Route
router.post('/login', loginUser); 

// Private Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

export default router;