import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';
import Notification from '../models/notificationModel.js';
// 🔥 IMPORT GAMIFICATION SERVICE (Adjust path if needed)
// 🔥 IMPORT GAMIFICATION SERVICE (Adjust path if needed)
import { awardPoints, handleStoryPostStreak } from './gamificationService.js';

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

    // 🔥 Award 10 points for posting a story (to both User Heatmap & Family)
    if (targetCircleId) {
      await awardPoints(req.user._id, targetCircleId, 10);
    }

    // ==========================================
    // 🔥 CRITICAL FIX: UPDATE STREAK HERE!
    // ==========================================
    await handleStoryPostStreak(req.user._id);

    const populated = await Story.findById(createdStory._id)
      .populate('user', 'name email relationToAdmin avatar')
      .populate('originCircleId', 'circleName familyCode');

    const io = req.app.get('io');
    if (io && targetCircleId) {
      io.to(String(targetCircleId)).emit('new_story_added', populated || createdStory);
    }

    return res.status(201).json(populated);
    
  } catch (error) {
    console.error("Story Creation Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const isAuthor = String(story.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    // 🔥 NEW: Deduct 10 points when story is deleted
    if (story.originCircleId) {
      await awardPoints(story.user, story.originCircleId, -10);
    }

    await Story.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: 'Story removed successfully' });
  } catch (error) {
    console.error("Delete Story Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const toggleLikeStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user._id.toString();

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const storyOwnerId = story.user.toString();
    const alreadyLiked = story.likes.some((id) => id.toString() === userId);

    const isDifferentFamily = 
      story.originCircleId && 
      req.user.activeCircleId && 
      story.originCircleId.toString() !== req.user.activeCircleId.toString();

    const isGlobalLike = story.isGlobalPublic && isDifferentFamily;
    const pointsToAward = isGlobalLike ? 4 : 2;

    let updatedStory;

    if (alreadyLiked) {
      // 🔥 FIX: Use $pull to guarantee removal (Bug C)
      updatedStory = await Story.findByIdAndUpdate(
        storyId,
        { $pull: { likes: req.user._id } },
        { new: true }
      );
      
      // Deduct points only if it's someone else's post
      if (userId !== storyOwnerId && story.originCircleId) {
        await awardPoints(req.user._id, story.originCircleId, -pointsToAward);
      }
    } else {
      // 🔥 FIX: Use $addToSet to guarantee uniqueness (no double count!) (Bug C)
      updatedStory = await Story.findByIdAndUpdate(
        storyId,
        { $addToSet: { likes: req.user._id } },
        { new: true }
      );

      // Award points only if it's someone else's post
      if (userId !== storyOwnerId && story.originCircleId) {
        await awardPoints(req.user._id, story.originCircleId, pointsToAward);
      }

      // Send Notification (Only if liking someone else's post)
      if (userId !== storyOwnerId) {
        const io = req.app.get('io');
        const newNotif = await Notification.create({
          recipient: storyOwnerId,
          sender: req.user._id,
          type: 'like',
          storyId: story._id,
          message: `${req.user.name} liked your memory: "${story.title}"`
        });
        if (io) io.to(storyOwnerId).emit('new_notification', newNotif);
      }
    }

    return res.status(200).json({
      message: alreadyLiked ? 'Story unliked' : 'Story liked',
      likesCount: updatedStory.likes.length,
      likes: updatedStory.likes,
    });
  } catch (error) {
    console.error("Toggle Like Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
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
      if (io) io.to(storyOwnerId).emit('new_notification', newNotif);
    }

    const isDifferentFamily = story.originCircleId && req.user.activeCircleId && story.originCircleId.toString() !== req.user.activeCircleId.toString();
    const isGlobalComment = story.isGlobalPublic && isDifferentFamily;
    const pointsToAward = isGlobalComment ? 8 : 4;

    if (userId !== storyOwnerId && story.originCircleId) {
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
    console.error("Add Comment Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
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
      .sort({ createdAt: -1 })
      .limit(15); 

    return res.status(200).json(stories);
  } catch (error) {
    console.error("Get Circle Feed Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
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
      .sort({ createdAt: -1 })
      .limit(15); 

    return res.status(200).json(stories);
  } catch (error) {
    console.error("Get My Family Stories Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getGlobalStories = async (req, res) => {
  try {
    const stories = await Story.find({ isGlobalPublic: true })
      .populate('user', 'name')
      .populate('originCircleId', 'circleName')
      .sort({ createdAt: -1 })
      .limit(50); 

    return res.status(200).json(stories);
  } catch (error) {
    console.error("Get Global Stories Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
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
    console.error("Get Story By Id Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const isAuthor = String(story.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this story' });
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
    console.error("Update Story Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
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
    console.error("Get My Stories Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
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