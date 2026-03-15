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
      uppercase: true, // code always uppercase store hoga
      trim: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FamilyMember',
      },
    ],
    // Phase 3 bridge
    savedGlobalStories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Story',
      },
    ],
  },
  { timestamps: true }
);

export default model('FamilyCircle', familyCircleSchema);