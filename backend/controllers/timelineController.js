import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js';

// Gets all milestone stories for a specific circle, ensuring the user is a member
const getTimelineMilestones = async (req, res) => {
  try {
    const { circleId } = req.params;
    if (!circleId) {
      return res.status(400).json({ message: 'circleId is required' });
    }
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
    console.error("getTimelineMilestones Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { getTimelineMilestones };