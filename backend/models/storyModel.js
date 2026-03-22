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

    // NEW: 24h expiry support
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// Fast feed query: by circle + latest first
storySchema.index({ originCircleId: 1, createdAt: -1 });

// TTL index: document auto-delete after expiresAt
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = model('Story', storySchema);

export default Story;