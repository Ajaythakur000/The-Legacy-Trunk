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
      enum: ['like', 'comment', 'post', 'milestone', 'system'],
      required: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story', // Click karne par kis story pe jana hai
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