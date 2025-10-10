const FamilyMember = require('../models/familyMember.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new family member
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await FamilyMember.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await FamilyMember.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
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

        const user = await FamilyMember.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
             res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
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
// @access  Private (Sirf logged-in user access kar sakta hai)
const getUserProfile = async (req, res) => {
    // Hamara 'protect' middleware user ki details dhoond kar 'req.user' mein daal dega.
    // Humein bas uss data ko response mein wapas bhejna hai.
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};


/**
 * @desc    Add a child to a parent's profile
 * @route   POST /api/users/me/children
 * @access  Private
 */
const addChild = async (req, res) => {
    try {
        const { email: childEmail } = req.body; // Child ka email request body se lena

        if (!childEmail) {
            return res.status(400).json({ message: 'Child email is required' });
        }

        // Child user ko email se dhoondhna
        const child = await FamilyMember.findOne({ email: childEmail });
        if (!child) {
            return res.status(404).json({ message: 'Child with this email not found' });
        }

        // Parent user (jo logged-in hai) ko dhoondhna
        const parent = await FamilyMember.findById(req.user._id);

        // Check karna ki child pehle se added to nahi hai
        if (parent.children.includes(child._id)) {
            return res.status(400).json({ message: 'Child is already added' });
        }

        // Child ki ID ko parent ke 'children' array mein add karna
        parent.children.push(child._id);
        await parent.save();

        res.json(parent);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, addChild }; 
