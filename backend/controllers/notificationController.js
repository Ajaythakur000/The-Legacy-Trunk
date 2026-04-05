import Notification from '../models/notificationModel.js';

// Get all notifications for the logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30); // LeetCode style: last 30 hi dikhayenge UI clean rakhne ke liye

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Mark a single notification as read
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

// Mark all notifications as read (Mark all as read feature)
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