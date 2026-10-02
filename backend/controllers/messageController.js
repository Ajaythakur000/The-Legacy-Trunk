import Message from '../models/messageModel.js';
import FamilyMember from '../models/familyMember.js';
import FamilyCircle from '../models/familyCircleModel.js'; 

// Retrieves the most recent chat messages for a specific family circle
const getFamilyMessages = async (req, res) => {
  try {
    const { familyCircleId } = req.params;
    const limit = Number(req.query.limit) || 50;

    if (!familyCircleId) {
      return res.status(400).json({ message: 'familyCircleId is required' });
    }

    const circle = await FamilyCircle.findOne({ _id: familyCircleId, members: req.user._id });
    if (!circle) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this vault.' });
    }

    const safeLimit = Math.max(1, Math.min(limit, 100));

    const messages = await Message.find({ familyCircleId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .select('familyCircleId sender senderName senderAvatar text imageUrl audioUrl reactions seenBy createdAt')
      .lean();

    return res.json({
      count: messages.length,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error("getFamilyMessages Error:", error.message); 
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Processes a media upload for chat messages and returns the file URL
const uploadChatMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No media file provided' });
    }

    return res.status(200).json({ 
      success: true, 
      url: req.file.path 
    });
  } catch (error) {
    console.error("uploadChatMedia Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { getFamilyMessages, uploadChatMedia };