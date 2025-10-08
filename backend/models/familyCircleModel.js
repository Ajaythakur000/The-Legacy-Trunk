const mongoose = require('mongoose');

const familyCircleSchema = new mongoose.Schema({
    circleName: { //
        type: String,
        required: [true, 'Please provide a name for the circle'],
        trim: true,
    },
    // Har circle ka ek owner (creator) hoga.
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'FamilyMember', // Yeh FamilyMember model se जुड़ा है
    },
    // Circle ke saare members ki ID is array mein store hogi.
    // Shuru mein, owner hi member hoga.
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
    }]
}, {
    timestamps: true
});

const FamilyCircle = mongoose.model('FamilyCircle', familyCircleSchema);

module.exports = FamilyCircle;