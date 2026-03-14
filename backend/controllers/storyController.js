// ✅ FIX - Add .default to all three imports
const Story = require('../models/storyModel.js').default;
const FamilyCircle = require('../models/familyCircleModel.js').default;
const FamilyMember = require('../models/familyMember.js').default;

/**
 * @desc    Create a new story (Private by default, can be Global)
 * @route   POST /api/stories
 * @access  Private
 */
const createStory = async (req, res) => {
  try {
    const { title, content, tags, isGlobalPublic } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let mediaUrl = '';
    let mediaType = 'text';

    if (req.file) {
      mediaUrl = req.file.path;
      if (req.file.mimetype?.startsWith('image')) mediaType = 'photo';
      else if (req.file.mimetype?.startsWith('video')) mediaType = 'video';
      else if (req.file.mimetype?.startsWith('audio')) mediaType = 'audio';
    }

    const story = new Story({
      title,
      content,
      tags: tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : [],
      user: req.user._id,
      originCircleId: req.user.activeCircleId,
      isGlobalPublic: isGlobalPublic === 'true' || isGlobalPublic === true,
      mediaUrl,
      mediaType,
    });

    const createdStory = await story.save();
    return res.status(201).json(createdStory);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getMyFamilyStories = async (req, res) => {
  try {
    const stories = await Story.find({
      $or: [
        { originCircleId: req.user.activeCircleId },
        { sharedWith: req.user.activeCircleId },
      ],
    })
      .populate('user', 'name relationToAdmin')
      .sort({ createdAt: -1 });

    return res.json(stories);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getGlobalStories = async (req, res) => {
  try {
    const stories = await Story.find({ isGlobalPublic: true })
      .populate('user', 'name')
      .populate('originCircleId', 'circleName')
      .sort({ createdAt: -1 });

    return res.json(stories);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('user', 'name')
      .populate('comments.user', 'name');

    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (
      !story.isGlobalPublic &&
      story.originCircleId.toString() !== req.user.activeCircleId.toString()
    ) {
      return res
        .status(401)
        .json({ message: 'Not authorized to view this private family story' });
    }

    return res.json(story);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const isAuthor = story.user.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === 'admin' &&
      story.originCircleId.toString() === req.user.activeCircleId.toString();

    if (!isAuthor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to edit this story' });
    }

    story.title = req.body.title ?? story.title;
    story.content = req.body.content ?? story.content;

    if (req.body.tags !== undefined) {
      story.tags = String(req.body.tags)
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }

    if (req.body.isGlobalPublic !== undefined) {
      story.isGlobalPublic = req.body.isGlobalPublic === 'true' || req.body.isGlobalPublic === true;
    }

    const updatedStory = await story.save();
    return res.json(updatedStory);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const isAuthor = story.user.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === 'admin' &&
      story.originCircleId.toString() === req.user.activeCircleId.toString();

    if (!isAuthor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this story' });
    }

    await Story.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Story removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  createStory,
  getMyFamilyStories,
  getGlobalStories,
  getStoryById,
  updateStory,
  deleteStory,
};