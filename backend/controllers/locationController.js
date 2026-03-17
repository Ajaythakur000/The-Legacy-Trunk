import FamilyMember from '../models/familyMember.js';
import { io } from '../index.js';

/**
 * Helper: compute activity status from timestamp
 * Rules:
 * - online: <= 5 min
 * - recently_active: > 5 min and <= 60 min
 * - offline: > 60 min or null
 */
const getActivityStatus = (lastLocationUpdatedAt) => {
  if (!lastLocationUpdatedAt) return 'offline';

  const now = Date.now();
  const updated = new Date(lastLocationUpdatedAt).getTime();
  const diffMinutes = (now - updated) / (1000 * 60);

  if (diffMinutes <= 5) return 'online';
  if (diffMinutes <= 60) return 'recently_active';
  return 'offline';
};

/**
 * @desc    Update current user's live location
 * @route   PUT /api/location/update
 * @access  Private
 */
const updateMyLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'latitude and longitude are required' });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: 'latitude/longitude must be valid numbers' });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'latitude must be between -90 and 90' });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'longitude must be between -180 and 180' });
    }

    const user = await FamilyMember.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.currentLocation = {
      type: 'Point',
      coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
    };
    user.lastLocationUpdatedAt = new Date();

    await user.save();

    // Real-time location broadcast to same family room
    if (user.activeCircleId) {
      io.to(String(user.activeCircleId)).emit('member_location_changed', {
        userId: user._id,
        name: user.name,
        latitude: lat,
        longitude: lng,
        currentLocation: user.currentLocation,
        lastLocationUpdatedAt: user.lastLocationUpdatedAt,
        status: getActivityStatus(user.lastLocationUpdatedAt),
      });
    }

    return res.json({
      message: 'Location updated successfully',
      location: user.currentLocation,
      lastLocationUpdatedAt: user.lastLocationUpdatedAt,
      status: getActivityStatus(user.lastLocationUpdatedAt),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get current user's location details
 * @route   GET /api/location/me
 * @access  Private
 */
const getMyLocation = async (req, res) => {
  try {
    const user = await FamilyMember.findById(req.user._id).select(
      'name currentLocation lastLocationUpdatedAt isGhostModeOn activeCircleId'
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      _id: user._id,
      name: user.name,
      currentLocation: user.currentLocation,
      lastLocationUpdatedAt: user.lastLocationUpdatedAt,
      isGhostModeOn: user.isGhostModeOn,
      status: getActivityStatus(user.lastLocationUpdatedAt),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Toggle ghost mode (privacy)
 * @route   PUT /api/location/ghost-mode
 * @access  Private
 */
const toggleGhostMode = async (req, res) => {
  try {
    const { isGhostModeOn } = req.body;

    if (typeof isGhostModeOn !== 'boolean') {
      return res.status(400).json({ message: 'isGhostModeOn must be boolean (true/false)' });
    }

    const user = await FamilyMember.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isGhostModeOn = isGhostModeOn;
    await user.save();

    // ✅ Real-time privacy state sync
    // Frontend can instantly hide/show user on map/list
    if (user.activeCircleId) {
      io.to(String(user.activeCircleId)).emit('member_privacy_changed', {
        userId: user._id,
        name: user.name,
        isGhostModeOn: user.isGhostModeOn,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.json({
      message: `Ghost mode ${isGhostModeOn ? 'enabled' : 'disabled'}`,
      isGhostModeOn: user.isGhostModeOn,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get family radar members (same activeCircleId)
 * @route   GET /api/location/family-radar
 * @access  Private
 */
const getFamilyRadar = async (req, res) => {
  try {
    if (!req.user.activeCircleId) {
      return res.status(400).json({ message: 'No active family circle found for user' });
    }

    const members = await FamilyMember.find({
      activeCircleId: req.user.activeCircleId,
    }).select(
      'name role relationToAdmin currentLocation lastLocationUpdatedAt isGhostModeOn activeCircleId'
    );

    // Privacy rule:
    // - self always visible
    // - others visible only when ghost mode OFF
    const radarMembers = members
      .filter((m) => {
        const isSelf = m._id.toString() === req.user._id.toString();
        if (isSelf) return true;
        return !m.isGhostModeOn;
      })
      .map((m) => ({
        _id: m._id,
        name: m.name,
        role: m.role,
        relationToAdmin: m.relationToAdmin,
        currentLocation: m.currentLocation,
        lastLocationUpdatedAt: m.lastLocationUpdatedAt,
        isGhostModeOn: m.isGhostModeOn,
        status: getActivityStatus(m.lastLocationUpdatedAt),
      }));

    return res.json({
      count: radarMembers.length,
      members: radarMembers,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export {
  updateMyLocation,
  getMyLocation,
  toggleGhostMode,
  getFamilyRadar,
};