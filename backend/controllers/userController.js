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
const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  relationToAdmin: user.relationToAdmin,
  familyCode: user.familyCode,

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

    // 🔥 STEP 1: Sirf validation aur Code generation karenge, Circle abhi nahi banayenge
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

    // 🔥 STEP 2: Pehle User create karo (Admin ke case mein circleId abhi undefined hai)
    const user = await FamilyMember.create({
      name,
      email,
      password,
      role,
      relationToAdmin: relationToAdmin || (role === 'admin' ? 'Admin' : ''),
      familyCode: finalFamilyCode,
      activeCircleId: circleId || null, 
    });

    // 🔥 STEP 3: Ab Admin ka ID mil gaya, toh Circle banao aur aapas mein link karo
    if (role === 'admin') {
      const newCircle = await FamilyCircle.create({
        circleName: `${name}'s Family Vault`,
        familyCode: finalFamilyCode,
        admin: user._id,            // ✅ FIX: Ab admin ki ID properly mil jayegi
        members: [user._id],        // ✅ FIX: Admin ko turant member list mein bhi daal diya
      });

      // User ke andar naye Circle ki ID update kar do
      user.activeCircleId = newCircle._id;
      await user.save();
    } else {
      // Normal member ke case mein purane circle mein member ko add karo
      await FamilyCircle.findByIdAndUpdate(circleId, {
        $addToSet: { members: user._id },
      });
    }

    // Note: Make sure tera `buildUserResponse` function file mein pehle se ho
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

  return res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    relationToAdmin: req.user.relationToAdmin,
    familyCode: req.user.familyCode,
    activeCircleId: req.user.activeCircleId || null,
    familyCircleId: req.user.activeCircleId || null,
  });
};

export { registerUser, loginUser, getUserProfile };