import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, verifyOTP, loginUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword } from '../controllers/userController.js'; 
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; 

const router = Router();

const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: { message: 'Too many requests from this IP, please try again after 2 minutes' }
});

// Registers a new user
router.post('/register', registerUser);

// Verifies a user's OTP
router.post('/verify-otp', authLimiter, verifyOTP);

// Logs in a user
router.post('/login', authLimiter, loginUser); 

// Initiates a password reset
router.post('/forgot-password', authLimiter, forgotPassword);

// Resets a user's password
router.post('/reset-password', authLimiter, resetPassword);

// Fetches the user's profile
router.get('/profile', protect, getUserProfile);

// Updates the user's profile
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

export default router;