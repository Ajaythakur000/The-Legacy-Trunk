import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js'; // 🔥 Added to check membership

// @desc    Get all milestones (Memory Lane) for a specific circle
// @route   GET /api/timeline/:circleId
// @access  Private
const getTimelineMilestones = async (req, res) => {
  try {
    const { circleId } = req.params;

    if (!circleId) {
      return res.status(400).json({ message: 'circleId is required' });
    }

    // 🔥 SECURITY FIX: Membership Check
    // Koi random ID guess karke family ke personal milestones nahi chura payega
    const circle = await FamilyCircle.findOne({ _id: circleId, members: req.user._id });
    if (!circle) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this circle.' });
    }

    const milestones = await Story.find({
      originCircleId: circleId,
      isMilestone: true
    })
    .populate('user', 'name avatar relationToAdmin')
    .sort({ milestoneDate: 1, createdAt: 1 }); 

    return res.status(200).json(milestones);
  } catch (error) {
    // 🔥 HIDDEN BUG FIX: Info leak blocked
    console.error("getTimelineMilestones Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { getTimelineMilestones };