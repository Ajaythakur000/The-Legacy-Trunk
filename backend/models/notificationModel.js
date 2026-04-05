import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    type: {
      type: String,
      // 🔥 'invite' yahan add kiya hai
      enum: ['like', 'comment', 'post', 'milestone', 'system', 'invite'],
      required: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story', 
    },
    // 🔥 NEW: circleId field for invite notifications
    circleId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyCircle',
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = model('Notification', notificationSchema);

export default Notification;