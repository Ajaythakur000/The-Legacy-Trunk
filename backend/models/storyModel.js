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

    // 🕒 FIXED: 24h expiry support (Made optional so Milestones don't delete!)
    expiresAt: {
      type: Date,
      required: false, // Changed from true to false
    },
  },
  {
    timestamps: true,
  }
);

// Fast feed query: by circle + latest first
storySchema.index({ originCircleId: 1, createdAt: -1 });

// TTL index: document auto-delete after expiresAt (Only deletes if expiresAt is present)
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = model('Story', storySchema);

export default Story;