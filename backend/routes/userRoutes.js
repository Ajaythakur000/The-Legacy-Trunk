import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, verifyOTP, loginUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword } from '../controllers/userController.js'; 
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; 

const router = Router();

const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window`
  message: { message: 'Too many requests from this IP, please try again after 2 minutes' }
});

// Public routes
router.post('/register', registerUser);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/login', authLimiter, loginUser); 

// 🔥 NEW: Password Reset Routes
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Private Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

export default router;