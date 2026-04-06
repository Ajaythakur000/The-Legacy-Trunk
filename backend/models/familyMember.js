import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

const familyMemberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, 
    },
    
    // ==============================
    // 🛡️ OTP & SECURITY FIELDS (NEW)
    // ==============================
    isVerified: {
      type: Boolean,
      default: true, // Purane users by default verified rahenge
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },

    // ==============================
    // 👤 USER PROFILE FIELDS
    // ==============================
    avatar: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    bio: {
      type: String,
      maxLength: 150,
      default: "Hey there! I am using FamilyVault.",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },

    // ==============================
    // 🛡️ ROLES & RELATIONSHIPS
    // ==============================
    role: {
      type: String,
      enum: ['admin', 'member', 'restricted'],
      default: 'member',
    },
    relationToAdmin: {
      type: String,
      trim: true,
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FamilyMember',
      },
    ],
    familyCode: {
      type: String,
    },
    activeCircleId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyCircle',
    },

    // ==============================
    // 📡 FAMILY RADAR FIELDS
    // ==============================
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
    lastLocationUpdatedAt: {
      type: Date,
      default: null,
    },
    isGhostModeOn: {
      type: Boolean,
      default: false,
    },

    // ==============================
    // 🔥 GAMIFICATION & STREAKS
    // ==============================
    currentStreak: {
      type: Number,
      default: 0
    },
    maxStreak: {
      type: Number,
      default: 0
    },
    lastLoginDate: {
      type: String, 
      default: null
    },
    lastPostDate: {
      type: String,
      default: null
    },
    activityMap: {
      type: Map,
      of: Number,
      default: {}
    },
    totalContributionPoints: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
  }
);

familyMemberSchema.index({ currentLocation: '2dsphere' });

familyMemberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  return next();
});

familyMemberSchema.methods.matchPassword = async function (enteredPassword) {
  return compare(enteredPassword, this.password);
};

const FamilyMember = model('FamilyMember', familyMemberSchema);
export default FamilyMember;