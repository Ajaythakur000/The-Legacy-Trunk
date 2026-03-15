import { Schema, model } from 'mongoose';

const familyCircleSchema = new Schema({
    circleName: { 
        type: String, 
        required: true 
    },
    familyCode: { 
        type: String, 
        required: true, 
        unique: true 
    },
    admin: { 
        type: Schema.Types.ObjectId, 
        ref: 'FamilyMember' 
    },
    members: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'FamilyMember' 
    }],
    // The Bridge for Phase 3 (Global Share)
    savedGlobalStories: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Story' 
    }]
}, { timestamps: true });

export default model('FamilyCircle', familyCircleSchema);