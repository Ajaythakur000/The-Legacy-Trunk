const FamilyMember = require('../models/familyMember.js');
// Naya import: Auto-vault creation ke liye
const FamilyCircle = require('../models/familyCircleModel.js'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new family member & Auto-Join/Create Vault
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        // Naye fields: familyCode (to join) aur relationToAdmin
        const { name, email, password, role, familyCode, relationToAdmin } = req.body;

        const userExists = await FamilyMember.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let circleId = null;
        let generatedCode = null;

        // LOGIC 1: Agar Admin register kar raha hai (Nayi Family banani hai)
        if (role === 'admin') {
            // Naya unique code generate karo (e.g., ZNT-1234)
            generatedCode = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;
            
            // Naya Family Vault create karo
            const newCircle = await FamilyCircle.create({
                circleName: `${name}'s Family Vault`,
                familyCode: generatedCode,
                admin: null // Thodi der me update karenge jab user ban jayega
            });
            circleId = newCircle._id;
        } 
        // LOGIC 2: Agar Member register kar raha hai (Existing Family join karni hai)
        else {
            if (!familyCode) {
                return res.status(400).json({ message: 'Family invite code is required for members' });
            }
            const existingCircle = await FamilyCircle.findOne({ familyCode });
            if (!existingCircle) {
                return res.status(404).json({ message: 'Invalid Family Code' });
            }
            circleId = existingCircle._id;
            generatedCode = familyCode;
        }

        // Hashing manual yahan se hata di hai kyunki models/familyMember.js me schema.pre('save') laga hua hai.
        const user = await FamilyMember.create({
            name,
            email,
            password, 
            role: role || 'member',
            relationToAdmin: relationToAdmin || 'Admin',
            familyCode: generatedCode,
            activeCircleId: circleId
        });

        // Agar admin ne vault banaya tha, toh vault me admin ka ID update kar do aur member list me daal do
        if (role === 'admin') {
            await FamilyCircle.findByIdAndUpdate(circleId, { 
                admin: user._id,
                $push: { members: user._id } 
            });
        } else {
             // Agar member join kar raha hai, bas use member list me daal do
             await FamilyCircle.findByIdAndUpdate(circleId, { 
                $push: { members: user._id } 
            });
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                relationToAdmin: user.relationToAdmin,
                familyCode: user.familyCode,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // .select('+password') zaruri hai kyunki schema me humne password ko select: false kiya tha
        const user = await FamilyMember.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
             res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                familyCode: user.familyCode,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private 
const getUserProfile = async (req, res) => {
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            relationToAdmin: req.user.relationToAdmin,
            familyCode: req.user.familyCode,
            activeCircleId: req.user.activeCircleId
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// addChild wala logic ab hume private vault me utna kaam nahi aayega, 
// kyunki hum members ko seedha 'FamilyCircle' (Vault) me add kar rahe hain. 
// Par reference ke liye abhi yahan chhod diya hai.

module.exports = { registerUser, loginUser, getUserProfile };