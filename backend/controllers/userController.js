import FamilyMember from '../models/familyMember.js';
import FamilyCircle from '../models/familyCircleModel.js';
import jwt from 'jsonwebtoken';

// JWT token banane ka helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Simple unique family code generator
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

// Shared response shape (single source of truth)
// 🔥 Added new profile fields here
const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  relationToAdmin: user.relationToAdmin,
  familyCode: user.familyCode,
  
  // New Identity fields
  avatar: user.avatar,
  bio: user.bio,
  dateOfBirth: user.dateOfBirth,

  // canonical + alias
  activeCircleId: user.activeCircleId || null,
  familyCircleId: user.activeCircleId || null,

  token: generateToken(user._id),
});

// @desc Register
// @route POST /api/users/register
// @access Public
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
      name,
      email,
      password,
      role,
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

    return res.status(201).json(buildUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc Login
// @route POST /api/users/login
// @access Public
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    email = email.trim().toLowerCase();

    const user = await FamilyMember.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return res.json(buildUserResponse(user));
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc Get profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Refactored to just use the new builder
  return res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    relationToAdmin: req.user.relationToAdmin,
    familyCode: req.user.familyCode,
    avatar: req.user.avatar,
    bio: req.user.bio,
    dateOfBirth: req.user.dateOfBirth,
    activeCircleId: req.user.activeCircleId || null,
    familyCircleId: req.user.activeCircleId || null,
  });
};

// ==========================================
// 🔥 NEW: Update Profile (DP, Bio, etc.)
// @route PUT /api/users/profile
// @access Private
// ==========================================
const updateUserProfile = async (req, res) => {
  try {
    const user = await FamilyMember.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update details if they exist in request body
    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.bio) user.bio = req.body.bio.trim();
    if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
    
    // Cloudinary URL if uploaded from frontend
    if (req.body.avatar) user.avatar = req.body.avatar;

    // Optional: Allow password change from profile
    if (req.body.password) {
      user.password = req.body.password; // Will be hashed by pre-save hook in model
    }

    const updatedUser = await user.save();

    // Return updated data
    return res.json(buildUserResponse(updatedUser));
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile: ' + error.message });
  }
};

// Make sure to export the new function
export { registerUser, loginUser, getUserProfile, updateUserProfile };