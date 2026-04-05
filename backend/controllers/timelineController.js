import Story from '../models/storyModel.js';

// @desc    Get all milestones (Memory Lane) for a specific circle
// @route   GET /api/timeline/:circleId

const getTimelineMilestones = async (req, res) => {
  try {
    const { circleId } = req.params;

    const milestones = await Story.find({
      originCircleId: circleId,
      isMilestone: true
    })
    .populate('user', 'name avatar relationToAdmin')
    // 🔥 CHANGE HERE: Pehle milestoneDate (Day), phir createdAt (Exact Time)
    .sort({ milestoneDate: 1, createdAt: 1 }); 

    return res.status(200).json(milestones);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export { getTimelineMilestones };