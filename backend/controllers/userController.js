import FamilyMember from '../models/familyMember.js';
import FamilyCircle from '../models/familyCircleModel.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new family member & Auto-Join/Create Vault
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, familyCode, relationToAdmin } = req.body;

    const userExists = await FamilyMember.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let circleId = null;
    let generatedCode = null;

    // Admin creates new family vault
    if (role === 'admin') {
      generatedCode = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;

      const newCircle = await FamilyCircle.create({
        circleName: `${name}'s Family Vault`,
        familyCode: generatedCode,
        admin: null,
        members: [],
      });

      circleId = newCircle._id;
    } else {
      // Member joins existing family
      if (!familyCode) {
        return res
          .status(400)
          .json({ message: 'Family invite code is required for members' });
      }

      const existingCircle = await FamilyCircle.findOne({ familyCode });
      if (!existingCircle) {
        return res.status(404).json({ message: 'Invalid Family Code' });
      }

      circleId = existingCircle._id;
      generatedCode = familyCode;
    }

    const user = await FamilyMember.create({
      name,
      email,
      password, // hashed by pre-save hook in model
      role: role || 'member',
      relationToAdmin: relationToAdmin || (role === 'admin' ? 'Admin' : ''),
      familyCode: generatedCode,
      activeCircleId: circleId,
    });

    // Update circle with user membership/admin
    if (role === 'admin') {
      await FamilyCircle.findByIdAndUpdate(circleId, {
        admin: user._id,
        $addToSet: { members: user._id },
      });
    } else {
      await FamilyCircle.findByIdAndUpdate(circleId, {
        $addToSet: { members: user._id },
      });
    }

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      relationToAdmin: user.relationToAdmin,
      familyCode: user.familyCode,
      activeCircleId: user.activeCircleId,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await FamilyMember.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        relationToAdmin: user.relationToAdmin,
        familyCode: user.familyCode,
        activeCircleId: user.activeCircleId,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    relationToAdmin: req.user.relationToAdmin,
    familyCode: req.user.familyCode,
    activeCircleId: req.user.activeCircleId,
  });
};

export { registerUser, loginUser, getUserProfile };