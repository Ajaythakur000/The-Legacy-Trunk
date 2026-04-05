import { Schema, model } from 'mongoose';

// Subdocument Schema for Comments
const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const storySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'FamilyMember',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add content for the story'],
    },
    tags: {
      type: [String],
      default: [],
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    
    // ==========================================
    // 🔥 NEW: MULTI-FILE & COLLAGE SUPPORT
    // ==========================================
    mediaUrls: {
      type: [String],
      default: [],
    },
    tone: {
      type: String,
      default: '', // Stores 'Nostalgic and Warm', etc.
    },
    // ==========================================

    mediaType: {
      type: String,
      enum: ['text', 'photo', 'audio', 'video'],
      default: 'text',
    },
    originCircleId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyCircle',
      required: true,
    },
    isGlobalPublic: {
      type: Boolean,
      default: false,
    },
    
    // ==========================================
    // 🔥 NEW: MEMORY LANE (MILESTONE) FEATURES
    // ==========================================
    isMilestone: {
      type: Boolean,
      default: false, // Normal story by default
    },
    milestoneDate: {
      type: Date,
      default: Date.now, // Agar date nahi di, toh aaj ki set hogi
    },
    // ==========================================

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FamilyMember',
      },
    ],
    comments: [commentSchema],
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FamilyCircle',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Fast feed query: by circle + latest first
storySchema.index({ originCircleId: 1, createdAt: -1 });

// 🔥 KACHRA GONE: Auto-delete wala index yahan se hata diya gaya hai!

const Story = model('Story', storySchema);

export default Story;