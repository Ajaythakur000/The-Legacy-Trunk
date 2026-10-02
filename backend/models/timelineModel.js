import { Schema, model } from 'mongoose';

const timelineSchema = new Schema(
  {
    originCircleId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyCircle',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a timeline title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Please add event year'],
      min: 1000,
      max: 3000,
      index: true,
    },
    eventDate: {
      type: Date,
      default: null,
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
    isGlobalPublic: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

timelineSchema.index({ originCircleId: 1, year: 1, createdAt: -1 });

const Timeline = model('Timeline', timelineSchema);

export default Timeline;