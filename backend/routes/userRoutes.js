const express = require('express');
const router = express.Router();

// Controller se sabhi functions ko import karna (addChild hata diya)
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController.js');
// Middleware se gatekeeper function ko import karna
const { protect } = require('../middleware/authMiddleware.js');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser); 

// Private Route (Ise sirf logged-in user hi access kar sakta hai)
router.get('/profile', protect, getUserProfile);

module.exports = router;