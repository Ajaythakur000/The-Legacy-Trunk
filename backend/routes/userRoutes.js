import { Router } from 'express';
import { registerUser, verifyOTP, loginUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword } from '../controllers/userController.js'; 
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; 

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser); 

// 🔥 NEW: Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Private Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

export default router;