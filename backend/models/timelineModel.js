import { Schema, model } from 'mongoose';

const timelineSchema = new Schema(
  {
    // Kis family vault/circle ki history event hai
    originCircleId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyCircle',
      required: true,
      index: true,
    },

    // Event kisne create kiya
    user: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },

    // Event title
    title: {
      type: String,
      required: [true, 'Please add a timeline title'],
      trim: true,
    },

    // Optional details
    description: {
      type: String,
      default: '',
      trim: true,
    },

    // Chronology key (sort ke liye)
    year: {
      type: Number,
      required: [true, 'Please add event year'],
      min: 1000,
      max: 3000,
      index: true,
    },

    // Optional exact date (if available)
    eventDate: {
      type: Date,
      default: null,
    },

    // Optional media
    mediaUrl: {
      type: String,
      default: '',
    },

    mediaType: {
      type: String,
      enum: ['text', 'photo', 'audio', 'video'],
      default: 'text',
    },

    // Public explore me dikhana hai ya nahi
    isGlobalPublic: {
      type: Boolean,
      default: false,
    },

    // Optional tags
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Family timeline fetch fast banane ke liye compound index
timelineSchema.index({ originCircleId: 1, year: 1, createdAt: -1 });

const Timeline = model('Timeline', timelineSchema);

export default Timeline;