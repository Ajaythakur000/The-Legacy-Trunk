const Timeline = require('../models/timelineModel.js');

/**
 * Helper: private event access check
 */
const canAccessTimelineEvent = (event, user) => {
  if (event.isGlobalPublic) return true;
  return event.originCircleId.toString() === user.activeCircleId.toString();
};

/**
 * @desc    Create a new timeline event
 * @route   POST /api/timelines
 * @access  Private
 */
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

    const timelineEvent = new Timeline({
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

    const created = await timelineEvent.save();
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get private family timeline events (chronological)
 * @route   GET /api/timelines/my-family
 * @access  Private
 */
const getMyFamilyTimeline = async (req, res) => {
  try {
    const events = await Timeline.find({
      $or: [
        { originCircleId: req.user.activeCircleId },
      ],
    })
      .populate('user', 'name relationToAdmin')
      .sort({ year: 1, eventDate: 1, createdAt: 1 });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get global public timeline events
 * @route   GET /api/timelines/global
 * @access  Private
 */
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

/**
 * @desc    Get single timeline event by ID
 * @route   GET /api/timelines/:id
 * @access  Private
 */
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

/**
 * @desc    Update timeline event
 * @route   PUT /api/timelines/:id
 * @access  Private
 */
const updateTimelineEvent = async (req, res) => {
  try {
    const event = await Timeline.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Timeline event not found' });

    const isAuthor = event.user.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === 'admin' &&
      event.originCircleId.toString() === req.user.activeCircleId.toString();

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
module.exports = { createTimeline, getMyTimelines, addEventToTimeline, getTimelineById }; // Naya function export kiya
=======
/**
 * @desc    Delete timeline event
 * @route   DELETE /api/timelines/:id
 * @access  Private
 */
const deleteTimelineEvent = async (req, res) => {
  try {
    const event = await Timeline.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Timeline event not found' });

    const isAuthor = event.user.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === 'admin' &&
      event.originCircleId.toString() === req.user.activeCircleId.toString();

    if (!isAuthor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this timeline event' });
    }

    await Timeline.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Timeline event removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  createTimelineEvent,
  getMyFamilyTimeline,
  getGlobalTimeline,
  getTimelineEventById,
  updateTimelineEvent,
  deleteTimelineEvent,
};
>>>>>>> cf9119e (4.feat(timeline): refactor to family-vault event model with chronological feeds and CRUD)
