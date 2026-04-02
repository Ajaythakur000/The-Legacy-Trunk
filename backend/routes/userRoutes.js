import { Router } from 'express';
const router = Router();

// 🔥 Yahan updateUserProfile ko import list mein add kiya
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/userController.js';

// Middleware se gatekeeper function ko import karna
import { protect } from '../middleware/authMiddleware.js';

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser); 

// Private Routes (Inhe sirf logged-in user hi access kar sakta hai)
router.get('/profile', protect, getUserProfile);

// 🔥 NAYA ROUTE: Profile update karne ke liye (DP, Bio, etc.)
router.put('/profile', protect, updateUserProfile);

export default router;