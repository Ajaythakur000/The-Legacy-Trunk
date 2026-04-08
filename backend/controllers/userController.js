import FamilyMember from '../models/familyMember.js';
import FamilyCircle from '../models/familyCircleModel.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; 
import { handleDailyLogin } from './gamificationService.js';
import bcrypt from 'bcryptjs'; 
import path from 'path';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const generateToken = (id) => {
  return jwt.sign({ id, type: 'auth' }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '30d' 
  });
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


const buildUserResponse = (user, bondPoints = 0) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  relationToAdmin: user.relationToAdmin,
  familyCode: user.familyCode,
  avatar: user.avatar,
  bio: user.bio,
  dateOfBirth: user.dateOfBirth,
  bondPoints: Number(bondPoints) || 0, // ✅ FIX: no hardcoded 0
  currentStreak: user.currentStreak || 0,
  maxStreak: user.maxStreak || 0,
  totalContributionPoints: user.totalContributionPoints || 0,
  activityMap: user.activityMap
    ? Object.fromEntries(user.activityMap.entries())
    : {},
  activeCircleId:
    typeof user.activeCircleId === 'object' && user.activeCircleId?._id
      ? user.activeCircleId._id
      : user.activeCircleId || null,
  familyCircleId:
    typeof user.activeCircleId === 'object' && user.activeCircleId?._id
      ? user.activeCircleId._id
      : user.activeCircleId || null,
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
    
    // Bug 7 & 12 Fix: Force Roles
    role = role ? role.trim().toLowerCase() : 'member';
    if (role !== 'admin' && role !== 'member') role = 'member'; 
    
    relationToAdmin = relationToAdmin ? relationToAdmin.trim() : '';

    let userExists = await FamilyMember.findOne({ email });
    
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    } else if (userExists && !userExists.isVerified) {
      if (userExists.activeCircleId) {
        await FamilyCircle.findByIdAndUpdate(userExists.activeCircleId, {
          $pull: { members: userExists._id }
        });
      }
      await FamilyMember.deleteOne({ email }); 
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

    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(plainOtp, salt);
    
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    const user = await FamilyMember.create({
      name, email, password, role,
      relationToAdmin: relationToAdmin || (role === 'admin' ? 'Admin' : ''),
      familyCode: finalFamilyCode,
      activeCircleId: circleId || null, 
      isVerified: false,
      otp: hashedOtp,
      otpExpires,
      otpAttempts: 0, 
      otpBlockedUntil: null
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

    const logoPath = path.join(process.cwd(), '../frontend/public/finall_logo.png');

    const mailOptions = {
      from: `"The Memento" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🗝️ Your Key to The Memento',
      html: `
        <div style="font-family: 'Georgia', serif; background-color: #f8fafc; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0;">
            <h1 style="color: #0f172a; font-size: 26px;">The Memento</h1>
            <h2>Welcome to the family, <strong>${user.name}</strong></h2>
            <div style="background: #F9F3E8; padding: 24px; border-radius: 16px;">
              <span style="font-size: 42px; font-weight: 900; letter-spacing: 10px;">${plainOtp}</span>
            </div>
            <p>This key is valid for 10 minutes.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    return res.status(201).json({ 
      message: 'OTP sent to email. Please verify.', 
      email: user.email,
      requireOtp: true 
    });

  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔴 REPLACE verifyOTP FUNCTION
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await FamilyMember.findOne({ email }).select('+otp +otpAttempts +otpBlockedUntil +otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });

    const now = Date.now();

    if (user.otpBlockedUntil && user.otpBlockedUntil.getTime() > now) {
      const minutesLeft = Math.ceil((user.otpBlockedUntil.getTime() - now) / 60000);
      return res.status(429).json({ message: `Too many failed attempts. Try again in ${minutesLeft} minutes.` });
    }

    if (!user.otp || !user.otpExpires || user.otpExpires.getTime() < now) {
      return res.status(400).json({ message: 'OTP has expired or does not exist. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(String(otp), user.otp);

    if (!isMatch) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;

      if (user.otpAttempts >= 5) {
        user.otpBlockedUntil = new Date(now + 10 * 60 * 1000);
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        return res.status(429).json({ message: 'Verification locked for 10 minutes due to too many failed attempts.' });
      }

      await user.save();
      const attemptsLeft = 5 - user.otpAttempts;
      return res.status(400).json({ message: `Invalid OTP. ${attemptsLeft} attempts remaining.` });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    user.otpBlockedUntil = null;
    await user.save();

    await handleDailyLogin(user._id, user.activeCircleId);

    const freshUser = await FamilyMember.findById(user._id).populate('activeCircleId', 'familyBondPoints');
    const bondPoints = freshUser?.activeCircleId?.familyBondPoints || 0;

    return res.status(200).json(buildUserResponse(freshUser, bondPoints));
  } catch (error) {
    console.error("VerifyOTP Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
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
      if (!user.isVerified) {
        
        const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        
        user.otp = await bcrypt.hash(plainOtp, salt);
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.otpAttempts = 0;
        user.otpBlockedUntil = null;
        await user.save();

        const mailOptions = {
          from: `"The Memento" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: '🗝️ Your NEW Key to The Memento',
          html: `
            <div style="font-family: 'Georgia', serif; text-align: center; padding: 40px;">
              <h2>Welcome back, <strong>${user.name}</strong></h2>
              <p>You haven't verified your vault yet. Here is your new access key:</p>
              <h1 style="letter-spacing: 10px;">${plainOtp}</h1>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);

        return res.status(403).json({ 
          message: 'Account not verified. A new OTP has been sent to your email.',
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
    console.error("Login Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userWithCircle = await FamilyMember.findById(req.user._id).populate('activeCircleId', 'familyBondPoints');
    if (!userWithCircle) return res.status(404).json({ message: 'User not found' });

    // 🔴 FIX: robust map conversion (works for Map + plain object + null)
    let activityMapPlain = {};
    if (userWithCircle.activityMap instanceof Map) {
      activityMapPlain = Object.fromEntries(userWithCircle.activityMap);
    } else if (userWithCircle.activityMap && typeof userWithCircle.activityMap === 'object') {
      activityMapPlain = { ...userWithCircle.activityMap };
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
  } catch (error) {
    console.error('getUserProfile Error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// 🔴 REPLACE updateUserProfile FUNCTION
const updateUserProfile = async (req, res) => {
  try {
    const user = await FamilyMember.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.role || req.body.isVerified || req.body.email || req.body.otp) {
      return res.status(403).json({ message: 'Attempt to update restricted fields blocked.' });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.bio) user.bio = req.body.bio.trim();
    if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
    if (req.body.password) user.password = req.body.password;

    if (req.body.activeCircleId) {
      const targetCircle = await FamilyCircle.findById(req.body.activeCircleId);
      if (!targetCircle) return res.status(404).json({ message: 'Target circle not found' });

      const isMember = targetCircle.members.some(memberId => String(memberId) === String(user._id));
      if (!isMember) {
        return res.status(403).json({ message: 'You are not a member of this circle.' });
      }
      user.activeCircleId = req.body.activeCircleId;
    }

    if (req.file) {
      user.avatar = req.file.path || req.file.secure_url;
    } else if (req.body.avatar && typeof req.body.avatar === 'string') {
      user.avatar = req.body.avatar;
    }

    await user.save();

    const freshUser = await FamilyMember.findById(user._id).populate('activeCircleId', 'familyBondPoints');
    const bondPoints = freshUser?.activeCircleId?.familyBondPoints || 0;

    return res.json(buildUserResponse(freshUser, bondPoints));
  } catch (error) {
    console.error("Profile Update Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { registerUser, verifyOTP, loginUser, getUserProfile, updateUserProfile };