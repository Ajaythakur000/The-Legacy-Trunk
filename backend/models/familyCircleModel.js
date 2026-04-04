import { Schema, model } from 'mongoose';

const familyCircleSchema = new Schema(
  {
    circleName: {
      type: String,
      required: true,
      trim: true,
    },
    familyCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FamilyMember',
      },
    ],
    savedGlobalStories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Story',
      },
    ],
    
    // ==============================
    // 💎 GAMIFICATION: FAMILY COLLECTIVE
    // ==============================
    familyBondPoints: {
      type: Number,
      default: 0,
      min: 0
    },
  },
  { timestamps: true }
);

export default model('FamilyCircle', familyCircleSchema);