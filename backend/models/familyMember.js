const mongoose = require('mongoose');

// Yeh humara database ka blueprint hai
const familyMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true 
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
        lowercase: true 
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['parent', 'grandparent', 'kid', 'chronicler'], // Inke alawa koi aur role nahi ho sakta
        default: 'kid' // Agar role na diya jaaye to default kid.. hoga
    },
    // Yeh array 'parent' user ke saare 'kid' users ki ID store karega.
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember'
    }]
}, {
    // Yeh automatically 'createdAt' aur 'updatedAt' fields add kar dega
    timestamps: true 
});

// Schema se Model banana
const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);

// Is Model ko doosri files mein use karne ke liye export karna
module.exports = FamilyMember;