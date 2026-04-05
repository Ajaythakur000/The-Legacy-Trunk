import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';
import Notification from '../models/notificationModel.js'; // 🔥 IMPORTED NOTIFICATION MODEL

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

    if (targetCircleId) {
      await FamilyCircle.findByIdAndUpdate(targetCircleId, {
        $inc: { familyBondPoints: 10 }
      });
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

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const isAuthor = story.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

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

    const userId = req.user._id.toString();
    const storyOwnerId = story.user.toString();
    const alreadyLiked = story.likes.some((id) => id.toString() === userId);

    const isDifferentFamily = 
      story.originCircleId && 
      req.user.activeCircleId && 
      story.originCircleId.toString() !== req.user.activeCircleId.toString();

    const isGlobalLike = story.isGlobalPublic && isDifferentFamily;
    const pointsToAward = isGlobalLike ? 10 : 5;

    if (alreadyLiked) {
      story.likes = story.likes.filter((id) => id.toString() !== userId);
    } else {
      story.likes.push(req.user._id);
      
      // 🔥 NEW: NOTIFICATION ENGINE (Send Notification if someone else likes)
      if (userId !== storyOwnerId) {
        const io = req.app.get('io');
        const newNotif = await Notification.create({
          recipient: storyOwnerId,
          sender: req.user._id,
          type: 'like',
          storyId: story._id,
          message: `${req.user.name} liked your memory: "${story.title}"`
        });
        
        // Emit real-time specific to the story owner
        if (io) {
          io.to(storyOwnerId).emit('new_notification', newNotif);
        }
      }
    }

    await story.save();

    if (userId !== storyOwnerId && story.originCircleId) {
      const pointModifier = alreadyLiked ? -pointsToAward : pointsToAward;
      await FamilyCircle.findByIdAndUpdate(story.originCircleId, {
        $inc: { familyBondPoints: pointModifier }
      });
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

    // 🔥 NEW: NOTIFICATION ENGINE (Send Notification if someone else comments)
    if (userId !== storyOwnerId) {
      const io = req.app.get('io');
      const newNotif = await Notification.create({
        recipient: storyOwnerId,
        sender: req.user._id,
        type: 'comment',
        storyId: story._id,
        message: `${req.user.name} commented: "${text.substring(0, 30)}..."`
      });
      
      // Emit real-time specific to the story owner
      if (io) {
        io.to(storyOwnerId).emit('new_notification', newNotif);
      }
    }

    if (userId !== storyOwnerId && story.originCircleId) {
      await FamilyCircle.findByIdAndUpdate(story.originCircleId, {
        $inc: { familyBondPoints: 5 }
      });
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