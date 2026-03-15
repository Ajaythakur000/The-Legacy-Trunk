import { Router } from 'express';
const router = Router();

// Controller se sabhi functions ko import karna (addChild hata diya)
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
// Middleware se gatekeeper function ko import karna
import { protect } from '../middleware/authMiddleware.js';

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser); 

// Private Route (Ise sirf logged-in user hi access kar sakta hai)
router.get('/profile', protect, getUserProfile);

export default router;