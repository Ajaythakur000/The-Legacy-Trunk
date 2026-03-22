import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';

const isExpiredStory = (story) => {
  if (!story?.expiresAt) return false;
  return new Date(story.expiresAt).getTime() <= Date.now();
};

const canAccessStory = (story, user) => {
  if (isExpiredStory(story)) return false;
  if (story.isGlobalPublic) return true;
  if (!user?.activeCircleId || !story?.originCircleId) return false;
  return story.originCircleId.toString() === user.activeCircleId.toString();
};

const createStory = async (req, res) => {
  try {
    const { title, content, tags, isGlobalPublic } = req.body;

    if (!req.user?.activeCircleId) {
      return res.status(400).json({ message: 'No active circle selected for this user' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let mediaUrl = '';
    let mediaType = 'text';

    if (req.file) {
      mediaUrl = req.file.path || req.file.secure_url || '';
      if (req.file.mimetype?.startsWith('image')) mediaType = 'photo';
      else if (req.file.mimetype?.startsWith('video')) mediaType = 'video';
      else if (req.file.mimetype?.startsWith('audio')) mediaType = 'audio';
    }

    const story = new Story({
      title: String(title).trim(),
      content: String(content).trim(),
      tags: tags
        ? String(tags).split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      user: req.user._id,
      originCircleId: req.user.activeCircleId,
      isGlobalPublic: isGlobalPublic === 'true' || isGlobalPublic === true,
      mediaUrl,
      mediaType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const createdStory = await story.save();

    const populated = await Story.findById(createdStory._id)
      .populate('user', 'name email relationToAdmin')
      .populate('originCircleId', 'circleName familyCode');

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getCircleFeed = async (req, res) => {
  try {
    if (!req.user?.activeCircleId) {
      return res.status(400).json({ message: 'No active circle selected' });
    }

    const now = new Date();

    const stories = await Story.find({
      originCircleId: req.user.activeCircleId,
      expiresAt: { $gt: now },
    })
      .populate('user', 'name email relationToAdmin')
      .populate('originCircleId', 'circleName')
      .sort({ createdAt: -1 });

    return res.status(200).json(stories);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getMyFamilyStories = async (req, res) => {
  try {
    if (!req.user?.activeCircleId) {
      return res.status(400).json({ message: 'No active circle selected' });
    }

    const now = new Date();

    const stories = await Story.find({
      $and: [
        {
          $or: [
            { originCircleId: req.user.activeCircleId },
            { sharedWith: req.user.activeCircleId },
          ],
        },
        { expiresAt: { $gt: now } },
      ],
    })
      .populate('user', 'name relationToAdmin')
      .sort({ createdAt: -1 });

    return res.status(200).json(stories);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const getGlobalStories = async (req, res) => {
  try {
    const now = new Date();

    const stories = await Story.find({
      isGlobalPublic: true,
      expiresAt: { $gt: now },
    })
      .populate('user', 'name')
      .populate('originCircleId', 'circleName')
      .sort({ createdAt: -1 });

    return res.status(200).json(stories);
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
      return res.status(401).json({ message: 'Not authorized to view this story or it is expired' });
    }

    return res.status(200).json(story);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (isExpiredStory(story)) {
      return res.status(400).json({ message: 'Cannot edit expired story' });
    }

    const isAuthor = story.user.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === 'admin' &&
      req.user.activeCircleId &&
      story.originCircleId.toString() === req.user.activeCircleId.toString();

    if (!isAuthor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to edit this story' });
    }

    story.title = req.body.title ?? story.title;
    story.content = req.body.content ?? story.content;

    if (req.body.tags !== undefined) {
      story.tags = String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean);
    }

    if (req.body.isGlobalPublic !== undefined) {
      story.isGlobalPublic = req.body.isGlobalPublic === 'true' || req.body.isGlobalPublic === true;
    }

    const updatedStory = await story.save();
    return res.status(200).json(updatedStory);
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
      req.user.activeCircleId &&
      story.originCircleId.toString() === req.user.activeCircleId.toString();

    if (!isAuthor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this story' });
    }

    await Story.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: 'Story removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const toggleLikeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!canAccessStory(story, req.user)) {
      return res.status(401).json({ message: 'Not authorized to like this story or it is expired' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = story.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) story.likes = story.likes.filter((id) => id.toString() !== userId);
    else story.likes.push(req.user._id);

    await story.save();

    return res.status(200).json({
      message: alreadyLiked ? 'Story unliked' : 'Story liked',
      likesCount: story.likes.length,
      likes: story.likes,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const addCommentToStory = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!canAccessStory(story, req.user)) {
      return res.status(401).json({ message: 'Not authorized to comment on this story or it is expired' });
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

export {
  createStory,
  getMyFamilyStories,
  getGlobalStories,
  getCircleFeed,
  getStoryById,
  updateStory,
  deleteStory,
  toggleLikeStory,
  addCommentToStory,
};