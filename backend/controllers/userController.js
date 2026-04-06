import FamilyMember from '../models/familyMember.js';
import FamilyCircle from '../models/familyCircleModel.js';
import jwt from 'jsonwebtoken';
// 🔥 IMPORT GAMIFICATION SERVICE
import { handleDailyLogin } from './gamificationService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateFamilyCode = async () => {
  let code = '';
  let found = true;

  while (found) {
    code = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const circle = await FamilyCircle.findOne({ familyCode: code });
    found = !!circle;
  }

  return code;
};

// Default response shape for login/register
const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  relationToAdmin: user.relationToAdmin,
  familyCode: user.familyCode,
  avatar: user.avatar,
  bio: user.bio,
  dateOfBirth: user.dateOfBirth,
  
  // Login ke time temporary 0 bhejo, profile aate hi update ho jayega
  bondPoints: 0, 

  // 🔥 SENDING NEW STREAK DATA TO FRONTEND
  currentStreak: user.currentStreak || 0,
  maxStreak: user.maxStreak || 0,

  activeCircleId: user.activeCircleId || null,
  familyCircleId: user.activeCircleId || null,
  token: generateToken(user._id),
});

const registerUser = async (req, res) => {
  try {
    let { name, email, password, role, familyCode, relationToAdmin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    role = role ? role.trim().toLowerCase() : 'member';
    relationToAdmin = relationToAdmin ? relationToAdmin.trim() : '';

    const userExists = await FamilyMember.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let circleId;
    let finalFamilyCode;

    if (role === 'admin') {
      finalFamilyCode = await generateFamilyCode();
    } else {
      if (!familyCode) {
        return res.status(400).json({ message: 'Family invite code is required' });
      }
      const normalizedCode = familyCode.trim().toUpperCase();
      const existingCircle = await FamilyCircle.findOne({ familyCode: normalizedCode });
      if (!existingCircle) {
        return res.status(404).json({ message: 'Invalid Family Code' });
      }
      circleId = existingCircle._id;
      finalFamilyCode = normalizedCode;
    }

    const user = await FamilyMember.create({
      name, email, password, role,
      relationToAdmin: relationToAdmin || (role === 'admin' ? 'Admin' : ''),
      familyCode: finalFamilyCode,
      activeCircleId: circleId || null, 
    });

    if (role === 'admin') {
      const newCircle = await FamilyCircle.create({
        circleName: `${name}'s Family Vault`,
        familyCode: finalFamilyCode,
        admin: user._id,          
        members: [user._id],        
      });
      user.activeCircleId = newCircle._id;
      await user.save();
    } else {
      await FamilyCircle.findByIdAndUpdate(circleId, {
        $addToSet: { members: user._id },
      });
    }

    // 🔥 Call logic for first login registration streak
    await handleDailyLogin(user._id, user.activeCircleId);

    // Fetch fresh user for updated streak data
    const freshUser = await FamilyMember.findById(user._id);
    return res.status(201).json(buildUserResponse(freshUser));
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    email = email.trim().toLowerCase();
    const user = await FamilyMember.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // 🔥 TRIGGER LOGIN GAMIFICATION BEFORE SENDING RESPONSE
      await handleDailyLogin(user._id, user.activeCircleId);
      
      // Fetch user again to get updated streak info
      const freshUser = await FamilyMember.findById(user._id);
      return res.json(buildUserResponse(freshUser));
    }
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ==========================================
// 🔥 PROFILE WITH FAMILY BOND POINTS & GRAPH DATA
// ==========================================
const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userWithCircle = await FamilyMember.findById(req.user._id).populate('activeCircleId', 'familyBondPoints');

  // Activity map conversion to plain JS object for frontend
  const activityMapPlain = {};
  if (userWithCircle.activityMap) {
    for (let [key, value] of userWithCircle.activityMap.entries()) {
      activityMapPlain[key] = value;
    }
  }

  return res.json({
    _id: userWithCircle._id,
    name: userWithCircle.name,
    email: userWithCircle.email,
    role: userWithCircle.role,
    relationToAdmin: userWithCircle.relationToAdmin,
    familyCode: userWithCircle.familyCode,
    avatar: userWithCircle.avatar,
    bio: userWithCircle.bio,
    dateOfBirth: userWithCircle.dateOfBirth,
    
    // 💎 Points & Streaks
    bondPoints: userWithCircle.activeCircleId?.familyBondPoints || 0,
    currentStreak: userWithCircle.currentStreak || 0,
    maxStreak: userWithCircle.maxStreak || 0,
    totalContributionPoints: userWithCircle.totalContributionPoints || 0,
    activityMap: activityMapPlain, // 🔥 Sent to frontend for Heatmap Graph

    activeCircleId: userWithCircle.activeCircleId?._id || null,
    familyCircleId: userWithCircle.activeCircleId?._id || null,
  });
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await FamilyMember.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.bio) user.bio = req.body.bio.trim();
    if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
    if (req.body.password) user.password = req.body.password; 

    if (req.body.activeCircleId) {
      user.activeCircleId = req.body.activeCircleId;
    }

    if (req.file) {
      user.avatar = req.file.path || req.file.secure_url;
    } else if (req.body.avatar && typeof req.body.avatar === 'string') {
      user.avatar = req.body.avatar;
    }

    const updatedUser = await user.save();
    
    const freshUser = await FamilyMember.findById(updatedUser._id).populate('activeCircleId', 'familyBondPoints');
    const response = buildUserResponse(freshUser);
    response.bondPoints = freshUser.activeCircleId?.familyBondPoints || 0; 

    return res.json(response);
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res.status(500).json({ message: 'Error updating profile: ' + error.message });
  }
};

export { registerUser, loginUser, getUserProfile, updateUserProfile };