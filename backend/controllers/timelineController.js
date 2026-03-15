import Timeline from '../models/timelineModel.js';

const canAccessTimelineEvent = (event, user) => {
  if (event.isGlobalPublic) return true;
  if (!event.originCircleId || !user.activeCircleId) return false;
  return event.originCircleId.toString() === user.activeCircleId.toString();
};

const createTimelineEvent = async (req, res) => {
  try {
    const { title, description, year, eventDate, tags, isGlobalPublic } = req.body;

    if (!title || year === undefined || year === null) {
      return res.status(400).json({ message: 'Title and year are required' });
    }

    let mediaUrl = '';
    let mediaType = 'text';

    if (req.file) {
      mediaUrl = req.file.path;
      if (req.file.mimetype?.startsWith('image')) mediaType = 'photo';
      else if (req.file.mimetype?.startsWith('video')) mediaType = 'video';
      else if (req.file.mimetype?.startsWith('audio')) mediaType = 'audio';
    }

    const event = await Timeline.create({
      originCircleId: req.user.activeCircleId,
      user: req.user._id,
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      year: Number(year),
      eventDate: eventDate || null,
      tags: tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
      isGlobalPublic: isGlobalPublic === 'true' || isGlobalPublic === true,
      mediaUrl,
      mediaType,
    });

    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

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
