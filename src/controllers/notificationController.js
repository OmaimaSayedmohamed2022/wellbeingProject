import { Notification } from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  export const markAsRead = async (req, res) => {
    try {
      await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
      res.status(200).json({ message: "Notification is Read" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  