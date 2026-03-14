const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // NAYA: Security ke liye

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
        required: true,
        select: false // NAYA: Taaki fetch karte waqt password frontend par leak na ho
    },
    // 1. FOR BACKEND PERMISSIONS (Security)
    role: {
        type: String,
        enum: ['admin', 'member', 'restricted'], 
        default: 'member' // Jo bhi invite code se join karega, by default member hoga
    },
    // 2. FOR FRONTEND UI & FAMILY TREE
    relationToAdmin: {
        type: String,
        trim: true
        // Yahan aayega: "Father", "Brother", "Wife", "Cousin" etc.
    },
    // Yeh array 'parent' user ke saare 'kid' users ki ID store karega.
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember'
    }],
    // ---- THE HERITAGE NETWORK UPGRADE (NAYE FIELDS) ----
    familyCode: {
        type: String, // Jaise "ZNT-492X"
    },
    activeCircleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyCircle'
    }
}, {
    timestamps: true 
});

// NAYA: Mongoose Pre-Save Hook (Database me save hone se pehle password hash karna)
familyMemberSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// NAYA: Password compare karne ka method (Login ke time kaam aayega)
familyMemberSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Schema se Model banana
const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);

// Is Model ko doosri files mein use karne ke liye export karna
module.exports = FamilyMember;