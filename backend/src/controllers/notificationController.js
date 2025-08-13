const Notification = require("../models/Notification");

const createNotification = async ({ user, sender, type, post = null, comment = null, mentionedUsers = [], points }) => {
  try {
    if (sender && user.toString() === sender.toString()) return; // Không tự thông báo cho chính mình

    const notification = new Notification({
      user,
      sender,
      type,
      post,
      comment,
      points
    });

    // Tạo notification cho các user được mention
    for (const mentionedUser of mentionedUsers) {
      if (mentionedUser.toString() !== sender.toString()) {
        const mentionNotification = new Notification({
          user: mentionedUser,
          sender,
          type: "mention",
          post,
          comment,
          points
        });
        await mentionNotification.save();
      }
    }
    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

const countNotifications = async (req, res) => {
    try {
      const count = await Notification.countDocuments({ user: req.user.id, isRead: false, isCounted: false });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Error counting notifications", error });
    }
  };

  const resetNotificationsCount = async (req, res) => {
    try {
      await Notification.updateMany({ user: req.user.id, isRead: false, isCounted: false }, { $set: { isCounted: true } });
      res.json({ message: "Notifications count reset" });
    } catch (error) {
      res.status(500).json({ message: "Error resetting count", error });
    }
  };
  
  const getNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .populate("sender", "username avatar fullName id")
        .populate("post", "title id")
        .populate("comment", "text itemId");
  
        res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications", error });
    }
  };

  const markNotificationsAsRead = async (req, res) => {
    try {
      await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
      res.json({ message: "Marked all notifications as read" });
    } catch (error) {
      res.status(500).json({ message: "Error marking notifications as read", error });
    }
  };

  const markNotificationRead = async (req, res) => {
    try {
      await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error marking notification", error });
    }
  };

  // ✅ Delete Item
  const deleteNotification = async (req, res) => {
    try {
      const { id } = req.params;
  
      const noti = await Notification.findByIdAndDelete(id);
  
      if (!noti) return res.status(404).json({ message: 'Item not found' });
  
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting notification', error: err });
    }
  };
  

module.exports = {countNotifications, getNotifications, markNotificationsAsRead, createNotification, resetNotificationsCount, markNotificationRead, deleteNotification}
  