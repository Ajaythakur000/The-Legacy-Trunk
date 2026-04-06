import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';
import Notification from '../models/notificationModel.js';
// 🔥 IMPORT GAMIFICATION SERVICE (Adjust path if needed)
import { awardPoints } from './gamificationService.js'; 

const createStory = async (req, res) => {
  try {
    const { title, content, tags, isGlobalPublic, circleId, isMilestone, milestoneDate, tone } = req.body;
    
    const targetCircleId = circleId || req.user?.activeCircleId;

    if (!targetCircleId) {
      return res.status(400).json({ message: 'No active circle selected for this user' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let mediaUrls = [];
    let mediaType = 'text';

    if (req.files && req.files.length > 0) {
      mediaUrls = req.files.map(file => file.path || file.secure_url);
      
      const firstMimeType = req.files[0].mimetype;
      if (firstMimeType?.startsWith('image')) mediaType = 'photo';
      else if (firstMimeType?.startsWith('video')) mediaType = 'video';
      else if (firstMimeType?.startsWith('audio')) mediaType = 'audio';
    }

    const primaryMediaUrl = mediaUrls.length > 0 ? mediaUrls[0] : '';
    const isThisAMilestone = isMilestone === 'true' || isMilestone === true;

    const story = new Story({
      title: String(title).trim(),
      content: String(content).trim(),
      tags: tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
      user: req.user._id,
      originCircleId: targetCircleId,
      isGlobalPublic: isGlobalPublic === 'true' || isGlobalPublic === true,
      mediaUrl: primaryMediaUrl, 
      mediaUrls: mediaUrls, 
      mediaType,
      tone, 
      isMilestone: isThisAMilestone, 
      milestoneDate: milestoneDate ? new Date(milestoneDate) : new Date()
    });

    const createdStory = await story.save();

    // 🔥 NEW: Award 10 points for posting a story (to both User Heatmap & Family)
    if (targetCircleId) {
      await awardPoints(req.user._id, targetCircleId, 10);
    }

    const populated = await Story.findById(createdStory._id)
      .populate('user', 'name email relationToAdmin avatar')
      .populate('originCircleId', 'circleName familyCode');

    const io = req.app.get('io');
    if (io && targetCircleId) {
      io.to(String(targetCircleId)).emit('new_story_added', populated || createdStory);
    }

    return res.status(201).json(populated);
    
  } catch (error) {
    console.error("Story Creation Error:", error);
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const isAuthor = story.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this story' });
    }

    // 🔥 NEW: Deduct 10 points when story is deleted
    if (story.originCircleId) {
      await awardPoints(story.user, story.originCircleId, -10);
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

    const userId = req.user._id.toString();
    const storyOwnerId = story.user.toString();
    const alreadyLiked = story.likes.some((id) => id.toString() === userId);

    const isDifferentFamily = 
      story.originCircleId && 
      req.user.activeCircleId && 
      story.originCircleId.toString() !== req.user.activeCircleId.toString();

    const isGlobalLike = story.isGlobalPublic && isDifferentFamily;
    
    // 🔥 UPDATED LOGIC: Global Like = 4 points, Family Like = 2 points
    const pointsToAward = isGlobalLike ? 4 : 2;

    if (alreadyLiked) {
      story.likes = story.likes.filter((id) => id.toString() !== userId);
    } else {
      story.likes.push(req.user._id);
      
      // Send Notification
      if (userId !== storyOwnerId) {
        const io = req.app.get('io');
        const newNotif = await Notification.create({
          recipient: storyOwnerId,
          sender: req.user._id,
          type: 'like',
          storyId: story._id,
          message: `${req.user.name} liked your memory: "${story.title}"`
        });
        if (io) {
          io.to(storyOwnerId).emit('new_notification', newNotif);
        }
      }
    }

    await story.save();

    // 🔥 NEW: Award points to the USER WHO LIKED IT (for their heatmap)
    if (userId !== storyOwnerId && story.originCircleId) {
      const pointModifier = alreadyLiked ? -pointsToAward : pointsToAward;
      await awardPoints(req.user._id, story.originCircleId, pointModifier);
    }

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

    story.comments.push({
      user: req.user._id,
      text: String(text).trim(),
    });

    await story.save();

    const userId = req.user._id.toString();
    const storyOwnerId = story.user.toString();

    // Notification Logic
    if (userId !== storyOwnerId) {
      const io = req.app.get('io');
      const newNotif = await Notification.create({
        recipient: storyOwnerId,
        sender: req.user._id,
        type: 'comment',
        storyId: story._id,
        message: `${req.user.name} commented: "${text.substring(0, 30)}..."`
      });
      if (io) {
        io.to(storyOwnerId).emit('new_notification', newNotif);
      }
    }

    // 🔥 NEW LOGIC: Family Comment = 4 points, Global Comment = 8 points
    const isDifferentFamily = story.originCircleId && req.user.activeCircleId && story.originCircleId.toString() !== req.user.activeCircleId.toString();
    const isGlobalComment = story.isGlobalPublic && isDifferentFamily;
    const pointsToAward = isGlobalComment ? 8 : 4;

    if (userId !== storyOwnerId && story.originCircleId) {
      // Award points to the USER WHO COMMENTED
      await awardPoints(req.user._id, story.originCircleId, pointsToAward);
    }

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

const getCircleFeed = async (req, res) => {
  try {
    const circleId = req.query.circleId || req.user?.activeCircleId;

    if (!circleId) {
      return res.status(400).json({ message: 'No active circle selected' });
    }

    const stories = await Story.find({ originCircleId: circleId })
      .populate('user', 'name email relationToAdmin')
      .populate('originCircleId', 'circleName')
      .populate('comments.user', 'name')
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

    const stories = await Story.find({
      $or: [
        { originCircleId: req.user.activeCircleId },
        { sharedWith: req.user.activeCircleId },
      ]
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
    const stories = await Story.find({ isGlobalPublic: true })
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
      .populate('user', 'name email relationToAdmin')
      .populate('originCircleId', 'circleName')
      .populate('comments.user', 'name'); 

    if (!story) return res.status(404).json({ message: 'Story not found' });

    return res.status(200).json(story);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const isAuthor = story.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

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

const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user._id })
      .populate('user', 'name')
      .populate('originCircleId', 'circleName')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(stories);
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
  getMyStories
};