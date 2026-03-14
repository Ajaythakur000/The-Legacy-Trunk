const mongoose = require('mongoose');

const familyCircleSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FamilyMember' 
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FamilyMember' 
    }],
    // The Bridge for Phase 3 (Global Share)
    savedGlobalStories: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Story' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('FamilyCircle', familyCircleSchema);