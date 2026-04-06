import Message from '../models/messageModel.js';
import FamilyMember from '../models/familyMember.js';
// 🔥 Ensure cloudinary is imported if you are uploading directly here, 
// Or if your multer middleware handles cloudinary, we just need the file path.

/**
 * @desc    Get chat history of a family vault
 * @route   GET /api/messages/:familyCircleId?limit=50
 * @access  Private
 */
const getFamilyMessages = async (req, res) => {
  try {
    const { familyCircleId } = req.params;
    const limit = Number(req.query.limit) || 50;

    if (!familyCircleId) {
      return res.status(400).json({ message: 'familyCircleId is required' });
    }

    const safeLimit = Math.max(1, Math.min(limit, 100));

    const messages = await Message.find({ familyCircleId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      // 🔥 FIX: Added senderAvatar, reactions, and seenBy so they don't disappear on refresh!
      .select('familyCircleId sender senderName senderAvatar text imageUrl audioUrl reactions seenBy createdAt')
      .lean();

    return res.json({
      count: messages.length,
      messages: messages.reverse(),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Upload media (image/audio) for chat
 * @route   POST /api/messages/upload
 * @access  Private
 */
const uploadChatMedia = async (req, res) => {
  try {
    // Ye assume karta hai ki tumhara Multer middleware Cloudinary pe file bhej kar 
    // req.file.path mein URL de deta hai (Jaise tumne Story/Profile mein kiya hoga)
    if (!req.file) {
      return res.status(400).json({ message: 'No media file provided' });
    }

    // Cloudinary URL wapas bhej do
    return res.status(200).json({ 
      success: true, 
      url: req.file.path 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Media Upload Failed: ' + error.message });
  }
};

export { getFamilyMessages, uploadChatMedia };