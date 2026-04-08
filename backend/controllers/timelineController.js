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

<<<<<<< HEAD
const getMyFamilyTimeline = async (req, res) => {
  try {
    const events = await Timeline.find({ originCircleId: req.user.activeCircleId })
      .populate('user', 'name relationToAdmin')
      .sort({ year: 1, eventDate: 1, createdAt: 1 });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getGlobalTimeline = async (req, res) => {
  try {
    const events = await Timeline.find({ isGlobalPublic: true })
      .populate('user', 'name')
      .populate('originCircleId', 'circleName')
      .sort({ year: 1, eventDate: 1, createdAt: 1 });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getTimelineEventById = async (req, res) => {
  try {
    const event = await Timeline.findById(req.params.id)
      .populate('user', 'name')
      .populate('originCircleId', 'circleName');

    if (!event) return res.status(404).json({ message: 'Timeline event not found' });

    if (!canAccessTimelineEvent(event, req.user)) {
      return res.status(401).json({ message: 'Not authorized to view this timeline event' });
    }

    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const updateTimelineEvent = async (req, res) => {
  try {
    const event = await Timeline.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Timeline event not found' });

    const isAuthor = event.user.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === 'admin' &&
      event.originCircleId?.toString() === req.user.activeCircleId?.toString();

    if (!isAuthor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to edit this timeline event' });
    }

    if (req.body.title !== undefined) event.title = String(req.body.title).trim();
    if (req.body.description !== undefined) event.description = String(req.body.description).trim();
    if (req.body.year !== undefined) event.year = Number(req.body.year);
    if (req.body.eventDate !== undefined) event.eventDate = req.body.eventDate || null;

    if (req.body.tags !== undefined) {
      event.tags = String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean);
    }

    if (req.body.isGlobalPublic !== undefined) {
      event.isGlobalPublic = req.body.isGlobalPublic === 'true' || req.body.isGlobalPublic === true;
    }

    const updated = await event.save();
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = { createTimeline, getMyTimelines, addEventToTimeline, getTimelineById }; // Naya function export kiya
=======
/**
 * @desc    Delete timeline event
 * @route   DELETE /api/timelines/:id
 * @access  Private
 */
=======
>>>>>>> 30177b5 (5.feat: integrate global search API, timeline chronology, and social engagement logic)
const deleteTimelineEvent = async (req, res) => {
  try {
    const event = await Timeline.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Timeline event not found' });

    const isAuthor = event.user.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === 'admin' &&
      event.originCircleId?.toString() === req.user.activeCircleId?.toString();

    if (!isAuthor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this timeline event' });
    }

    await Timeline.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Timeline event removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export {
  createTimelineEvent,
  getMyFamilyTimeline,
  getGlobalTimeline,
  getTimelineEventById,
  updateTimelineEvent,
  deleteTimelineEvent,
};
>>>>>>> cf9119e (4.feat(timeline): refactor to family-vault event model with chronological feeds and CRUD)
=======
export { getTimelineMilestones };
>>>>>>> fc16c9d (feat: Add milestone flag, toggle in composer, and timeline API sorted by date)
