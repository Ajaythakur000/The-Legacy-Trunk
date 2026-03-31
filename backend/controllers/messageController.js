import Message from '../models/messageModel.js';
import FamilyMember from '../models/familyMember.js';

/**
 * @desc    Get chat history of a family vault
 * @route   GET /api/messages/:familyCircleId?limit=50
 * @access  Private
 */
/**
 * @desc    Get chat history of a family vault
 * @route   GET /api/messages/:familyCircleId?limit=50
 * @access  Private
 */
const getFamilyMessages = async (req, res) => {
  try {
    const { familyCircleId } = req.params;
    const limit = Number(req.query.limit) || 50;

    // Basic validation
    if (!familyCircleId) {
      return res.status(400).json({ message: 'familyCircleId is required' });
    }

    // Keep limit in safe range for performance
    const safeLimit = Math.max(1, Math.min(limit, 100));

    // 🔥 BOUNCER FIXED: Removed the old strict me.activeCircleId check. 
    // Now it fetches messages directly for the requested Family Circle.
    const messages = await Message.find({ familyCircleId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .select('familyCircleId sender senderName text createdAt')
      .lean();

    return res.json({
      count: messages.length,
      messages: messages.reverse(),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export { getFamilyMessages };