import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  updateMyLocation,
  getMyLocation,
  toggleGhostMode,
  getFamilyRadar,
} from '../controllers/locationController.js';

const router = Router();

/**
 * PUT /api/location/update
 * body: { latitude, longitude }
 */
router.put('/update', protect, updateMyLocation);

/**
 * GET /api/location/me
 */
router.get('/me', protect, getMyLocation);

/**
 * GET /api/location/family-radar
 */
router.get('/family-radar', protect, getFamilyRadar);

/**
 * PUT /api/location/ghost-mode
 * body: { isGhostModeOn: true/false }
 */
router.put('/ghost-mode', protect, toggleGhostMode);

export default router;