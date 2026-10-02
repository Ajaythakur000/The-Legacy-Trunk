import Notification from '../models/notificationModel.js';
import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';

// Fetches the 30 most recent notifications for the currently logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30); 

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Marks a single specific notification as read in the database
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Updates all unread notifications for the current user to read status
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Handles a user accepting an invite to join a family circle
export const acceptInvite = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    
    if (!notification || notification.type !== 'invite') {
      return res.status(404).json({ message: 'Invite not found or invalid' });
    }

    const circle = await FamilyCircle.findById(notification.circleId);
    if (!circle) return res.status(404).json({ message: 'Family Circle no longer exists' });

    if (!circle.members.some(m => String(m) === String(req.user._id))) {
      circle.members.push(req.user._id);
      await circle.save();
    }

    await FamilyMember.findByIdAndUpdate(req.user._id, {
      activeCircleId: circle._id,
      familyCode: circle.familyCode,
    });

    notification.isRead = true;
    notification.message = `You joined ${circle.circleName}`;
    notification.type = 'system'; 
    await notification.save();

    return res.status(200).json({ message: 'Welcome to the family!', circleId: circle._id });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Handles a user rejecting a family circle invite
export const rejectInvite = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    
    if (!notification || notification.type !== 'invite') {
      return res.status(404).json({ message: 'Invite not found or invalid' });
    }

    notification.isRead = true;
    notification.message = 'Invite rejected';
    notification.type = 'system'; 
    await notification.save();

    return res.status(200).json({ message: 'Invite declined' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};