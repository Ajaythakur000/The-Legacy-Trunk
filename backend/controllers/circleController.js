const FamilyCircle = require('../models/familyCircleModel.js');
const FamilyMember = require('../models/familyMember.js'); 
/**
 * @desc    Create a new family circle
 * @route   POST /api/circles
 * @access  Private
 */
const createCircle = async (req, res) => {
    try {
        const { circleName } = req.body;

        if (!circleName) {
            return res.status(400).json({ message: 'Circle name is required' });
        }

        // Naya circle create karna
        const circle = new FamilyCircle({
            circleName,
            owner: req.user._id, // Jo user logged-in hai, woh owner ban jaayega
            members: [req.user._id] // Owner shuru mein member bhi hoga
        });

        const createdCircle = await circle.save();
        res.status(201).json(createdCircle);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Add a member to a family circle
 * @route   POST /api/circles/:id/members
 * @access  Private
 */
const addMemberToCircle = async (req, res) => {
    try {
        const circleId = req.params.id;
        const { email } = req.body; // Hum member ko uske email se add karenge

        // 1. Circle ko dhoondho
        const circle = await FamilyCircle.findById(circleId);
        if (!circle) {
            return res.status(404).json({ message: 'Circle not found' });
        }

        // 2. Security Check: Kya request karne wala user is circle ka owner hai?
        if (circle.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized, only the owner can add members' });
        }

        // 3. Jise add karna hai, uss member ko email se dhoondho
        const memberToAdd = await FamilyMember.findOne({ email });
        if (!memberToAdd) {
            return res.status(404).json({ message: 'User with this email not found' });
        }

        // 4. Check karo ki member pehle se added to nahi hai
        if (circle.members.includes(memberToAdd._id)) {
            return res.status(400).json({ message: 'User is already a member of this circle' });
        }

        // 5. Member ko circle mein add karo
        circle.members.push(memberToAdd._id);
        await circle.save();

        res.json(circle);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};


/**
 * @desc    Get all circles the user is a member of
 * @route   GET /api/circles
 * @access  Private
 */
const getMyCircles = async (req, res) => {
    try {
        // Aise saare circles dhoondo jinke 'members' array mein current user ki ID ho.
        const circles = await FamilyCircle.find({ members: req.user._id });
        res.json(circles);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Remove a member from a family circle
 * @route   DELETE /api/circles/:circleId/members/:memberId
 * @access  Private
 */
const removeMemberFromCircle = async (req, res) => {
    try {
        const { circleId, memberId } = req.params;

        const circle = await FamilyCircle.findById(circleId);
        if (!circle) {
            return res.status(404).json({ message: 'Circle not found' });
        }

        // Security Check: Sirf circle ka owner hi member remove kar sakta hai.
        if (circle.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized, only the owner can remove members' });
        }

        // Security Check: Owner khud ko remove nahi kar sakta.
        if (circle.owner.toString() === memberId) {
            return res.status(400).json({ message: 'Owner cannot be removed from the circle' });
        }

        // Member ko 'members' array se hatao
        circle.members.pull(memberId);
        await circle.save();

        res.json(circle);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = { createCircle, addMemberToCircle, getMyCircles, removeMemberFromCircle };