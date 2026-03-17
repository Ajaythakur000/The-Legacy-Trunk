import Message from '../models/messageModel.js';
import FamilyMember from '../models/familyMember.js';

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

    // Logged-in user load (safe check from DB)
    const me = await FamilyMember.findById(req.user._id).select('activeCircleId');
    if (!me) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Security check:
    // user can only read messages of their own active family vault
    if (!me.activeCircleId || me.activeCircleId.toString() !== familyCircleId) {
      return res.status(403).json({ message: 'Access denied for this family vault' });
    }

    // Keep limit in safe range for performance
    const safeLimit = Math.max(1, Math.min(limit, 100));

    // Fetch latest messages first, then reverse for chat order (old -> new)
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