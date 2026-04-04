import { Router } from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

// 🔥 NAYA: Apna multer/cloudinary middleware import kar. 
// (Tere folder structure ke hisaab se path adjust kar lena agar naam alag ho)
import upload from '../middleware/uploadMiddleware.js'; 

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser); 

// Private Routes
router.get('/profile', protect, getUserProfile);

// 🔥 THE FIX: 'upload.single("avatar")' gatekeeper yahan lagana hai!
// Ye request aane par image pakdega, Cloudinary pe dalega, aur req.file bana dega.
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

export default router;