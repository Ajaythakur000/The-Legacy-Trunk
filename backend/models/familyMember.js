import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

// Family Member Schema
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
      select: false, // password query results me by default nahi aayega
    },

    // ==============================
    // 👤 USER PROFILE FIELDS (Day 1)
    // ==============================
    avatar: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg", // Default placeholder image
    },
    bio: {
      type: String,
      maxLength: 150, // Lamba text rokne ke liye
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

    // UI relationship label (Father, Brother, etc.)
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

    /**
     * GeoJSON format:
     * {
     * type: "Point",
     * coordinates: [longitude, latitude]
     * }
     *
     * IMPORTANT:
     * - coordinates order ALWAYS [lng, lat]
     * - not [lat, lng]
     */
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

    // last time when location was updated
    lastLocationUpdatedAt: {
      type: Date,
      default: null,
    },

    // Privacy toggle: true => hidden from family radar
    isGhostModeOn: {
      type: Boolean,
      default: false,
    },
    // ... existing fields ...
    avatar: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    bio: {
      type: String,
      maxLength: 150,
      default: "Hey there! I am using FamilyVault.",
    },
    // 🔥 NAYA FIELD: Aura Engine
    // User Schema ke andar add kar de:
    bondPoints: {
      type: Number,
      default: 0,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Geo index for location queries.
 * This is required for geospatial operations ($near, etc.) in future.
 */
familyMemberSchema.index({ currentLocation: '2dsphere' });

// Password hash before save
familyMemberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  return next();
});

// Password compare helper (login)
familyMemberSchema.methods.matchPassword = async function (enteredPassword) {
  return compare(enteredPassword, this.password);
};

const FamilyMember = model('FamilyMember', familyMemberSchema);

export default FamilyMember;