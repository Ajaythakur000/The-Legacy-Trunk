import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  updateMyLocation,
  getMyLocation,
  toggleGhostMode,
  getFamilyRadar,
} from '../controllers/locationController.js';

const router = Router();

// Updates the user's location
router.put('/update', protect, updateMyLocation);

// Fetches the user's location
router.get('/me', protect, getMyLocation);

// Fetches the family radar
router.get('/family-radar', protect, getFamilyRadar);

// Toggles ghost mode for the user
router.put('/ghost-mode', protect, toggleGhostMode);

export default router;