const express = require('express');
const router = express.Router();

// Controller se sabhi functions ko import karna
const { registerUser, loginUser, getUserProfile, addChild } = require('../controllers/userController.js');
// Middleware se gatekeeper function ko import karna
const { protect } = require('../middleware/authMiddleware.js');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser); 

// Private routes
// Private Route (Ise sirf logged-in user hi access kar sakta hai)
// Yahan humne `protect` ko `getUserProfile` se pehle rakha hai.
// Iska matlab request pehle `protect` ke paas jaayegi, fir `getUserProfile` ke paas.
router.get('/profile', protect, getUserProfile);

// Naya route ek parent ko child add karne ke liye
router.route('/me/children').post(protect, addChild);

module.exports = router;