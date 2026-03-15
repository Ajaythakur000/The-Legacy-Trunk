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
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

export default model('Message', messageSchema);