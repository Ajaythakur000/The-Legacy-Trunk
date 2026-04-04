import Story from '../models/storyModel.js';

// @desc    Get all milestones (Memory Lane) for a specific circle
// @route   GET /api/timeline/:circleId
const getTimelineMilestones = async (req, res) => {
  try {
    const { circleId } = req.params;

    // 🔥 Sirf wo stories laao jo isMilestone: true hain aur us circle ki hain
    const milestones = await Story.find({
      originCircleId: circleId,
      isMilestone: true
    })
    .populate('user', 'name avatar relationToAdmin') // User ki detail taaki photo dikh sake
    .sort({ milestoneDate: 1 }); // 1 matlab Oldest First (History ki tarah)

    return res.status(200).json(milestones);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export { getTimelineMilestones };