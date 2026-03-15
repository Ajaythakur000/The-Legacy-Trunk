// ✅ Keeping your current import style (.default) for compatibility with your setup
const Story = require('../models/storyModel.js').default;
const FamilyCircle = require('../models/familyCircleModel.js').default;
const FamilyMember = require('../models/familyMember.js').default;

/**
 * Helper: private story access check
 */
const canAccessStory = (story, user) => {
  if (story.isGlobalPublic) return true;
  return story.originCircleId.toString() === user.activeCircleId.toString();
};

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

    if (!canAccessStory(story, req.user)) {
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
      story.isGlobalPublic =
        req.body.isGlobalPublic === 'true' || req.body.isGlobalPublic === true;
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

/**
 * @desc    Toggle like/unlike on a story
 * @route   PUT /api/stories/:id/like
 * @access  Private
 */
const toggleLikeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!canAccessStory(story, req.user)) {
      return res.status(401).json({ message: 'Not authorized to like this story' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = story.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      story.likes = story.likes.filter((id) => id.toString() !== userId);
    } else {
      story.likes.push(req.user._id);
    }

    await story.save();

    return res.json({
      message: alreadyLiked ? 'Story unliked' : 'Story liked',
      likesCount: story.likes.length,
      likes: story.likes,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Add comment to a story
 * @route   POST /api/stories/:id/comments
 * @access  Private
 */
const addCommentToStory = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!canAccessStory(story, req.user)) {
      return res.status(401).json({ message: 'Not authorized to comment on this story' });
    }

    story.comments.push({
      user: req.user._id,
      text: String(text).trim(),
    });

    await story.save();

    const populatedStory = await Story.findById(story._id)
      .populate('comments.user', 'name')
      .populate('user', 'name');

    return res.status(201).json({
      message: 'Comment added successfully',
      commentsCount: populatedStory.comments.length,
      comments: populatedStory.comments,
    });
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
  toggleLikeStory,
  addCommentToStory,
};