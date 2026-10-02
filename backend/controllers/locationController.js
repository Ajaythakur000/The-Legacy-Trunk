import FamilyMember from '../models/familyMember.js';
import { io } from '../index.js';

// Determines if a user is online, recently active, or offline based on their last location update time
const getActivityStatus = (lastLocationUpdatedAt) => {
  if (!lastLocationUpdatedAt) return 'offline';

  const now = Date.now();
  const updated = new Date(lastLocationUpdatedAt).getTime();
  const diffMinutes = (now - updated) / (1000 * 60);

  if (diffMinutes <= 5) return 'online';
  if (diffMinutes <= 60) return 'recently_active';
  return 'offline';
};

// Updates the currently logged-in user's GPS coordinates and broadcasts them to their active circle
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
      coordinates: [lng, lat],
    };
    user.lastLocationUpdatedAt = new Date();

    await user.save();

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

// Retrieves the current user's last known location and ghost mode status
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

// Toggles the user's ghost mode on or off to hide or share their location with family
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

// Returns a list of visible family members and their locations for the radar view
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