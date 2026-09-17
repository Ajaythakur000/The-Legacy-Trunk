import { Schema, model } from 'mongoose';

const messageSchema = new Schema(
  {
    familyCircleId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyCircle',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderAvatar: {
      type: String,
      default: '', //  Ab refresh karne pe photo gayab nahi hogi
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '', 
    },
    imageUrl: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
      default: '',
    },

    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
        userName: { type: String }
      }
    ],
    seenBy: [
      { type: Schema.Types.ObjectId, ref: 'FamilyMember' }
    ]
  },
  { timestamps: true }
);

export default model('Message', messageSchema);