import FamilyMember from '../models/familyMember.js';
import FamilyCircle from '../models/familyCircleModel.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // 🔥 IMPORT NODEMAILER
import { handleDailyLogin } from './gamificationService.js';

// 🔥 SETUP EMAIL TRANSPORTER
// (Make sure to add EMAIL_USER and EMAIL_PASS to your .env file)
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

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
  bondPoints: 0, 
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

    let userExists = await FamilyMember.findOne({ email });
    
    // Agar user hai par unverified hai, toh usko delete karke naya banne do (ya purane pe OTP bhej do)
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    } else if (userExists && !userExists.isVerified) {
      await FamilyMember.deleteOne({ email }); // Delete unverified ghost account
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

    // 🔥 GENERATE 6-DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    const user = await FamilyMember.create({
      name, email, password, role,
      relationToAdmin: relationToAdmin || (role === 'admin' ? 'Admin' : ''),
      familyCode: finalFamilyCode,
      activeCircleId: circleId || null, 
      isVerified: false, // 🔴 Naya user verified nahi hai
      otp,
      otpExpires
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

    // 🔥 SEND OTP EMAIL
    const mailOptions = {
      from: `"The Memento" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🗝️ Your Key to The Memento ',
      html: `
        <div style="font-family: 'Georgia', serif; background-color: #f8fafc; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            
            <div style="margin-bottom: 24px;">
              <div style="width: 80px; height: 80px; background-color: #F9F3E8; border-radius: 50%; margin: 0 auto; display: inline-flex; align-items: center; justify-content: center; border: 3px solid #f8fafc; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <span style="font-size: 40px; line-height: 80px; display: block; margin: 0 auto;">🌳</span>
              </div>
            </div>

            <h1 style="color: #0f172a; font-size: 26px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.5px;">The Memento</h1>
            <h2 style="color: #64748b; font-size: 18px; font-weight: normal; margin: 0 0 32px 0; font-family: system-ui, sans-serif;">
              Welcome to the family, <strong style="color: #0f172a;">${user.name}</strong>
            </h2>

            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 32px; font-family: system-ui, sans-serif;">
              Your private legacy vault is almost ready. Please use the royal seal below to verify your identity and unlock your family's memories.
            </p>

            <div style="background: linear-gradient(135deg, #F9F3E8 0%, #F5E6D3 100%); padding: 24px; border-radius: 16px; margin-bottom: 32px; border: 1px solid #EADDCD;">
              <span style="display: block; font-size: 11px; color: #8C6D46; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; margin-bottom: 12px; font-family: system-ui, sans-serif;">Your Verification Key</span>
              <span style="font-size: 42px; font-weight: 900; color: #4A332A; letter-spacing: 10px; display: block;">${otp}</span>
            </div>

            <p style="color: #94a3b8; font-size: 13px; font-family: system-ui, sans-serif;">
              This key is valid for the next 10 minutes. For your vault's security, please do not share this with anyone.
            </p>
          </div>
          
          <div style="margin-top: 32px; color: #94a3b8; font-size: 12px; font-family: system-ui, sans-serif;">
            &copy; ${new Date().getFullYear()} The Memento. Preserving memories forever.
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    

    // 🔴 IMPORTANT: We don't send the token yet. We tell frontend to open OTP Popup!
    return res.status(201).json({ 
      message: 'OTP sent to email. Please verify.', 
      email: user.email,
      requireOtp: true 
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ==========================================
// 🔥 NEW: VERIFY OTP FUNCTION
// ==========================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await FamilyMember.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });
    
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // OTP is valid! Verify user and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    await handleDailyLogin(user._id, user.activeCircleId);
    
    const freshUser = await FamilyMember.findById(user._id);
    return res.status(200).json(buildUserResponse(freshUser)); // Send Token Now!

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
      // 🔴 Block unverified users from logging in
      if (!user.isVerified) {
        return res.status(403).json({ 
          message: 'Account not verified. Please complete OTP verification.',
          requireOtp: true,
          email: user.email
        });
      }

      await handleDailyLogin(user._id, user.activeCircleId);
      
      const freshUser = await FamilyMember.findById(user._id);
      return res.json(buildUserResponse(freshUser));
    }
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userWithCircle = await FamilyMember.findById(req.user._id).populate('activeCircleId', 'familyBondPoints');

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
    bondPoints: userWithCircle.activeCircleId?.familyBondPoints || 0,
    currentStreak: userWithCircle.currentStreak || 0,
    maxStreak: userWithCircle.maxStreak || 0,
    totalContributionPoints: userWithCircle.totalContributionPoints || 0,
    activityMap: activityMapPlain, 
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

export { registerUser, verifyOTP, loginUser, getUserProfile, updateUserProfile }; // 🔥 ADDED verifyOTP EXPORT