import { Admin } from "../models/adminModel.js";
import { Notification } from "../models/notificationModel.js";
import Session from "../models/sessionModel.js";
import {getIo,onlineUsers} from "../config/socketio.js"

const ADMIN_ID = "67a7ed1765eebdbbbc6982f7";

// ✅ Fetch Notifications
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mark Notification as Read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendNotification = async (userId, message) => {
    try {
      // Save notification for the user
      const userNotification = new Notification({ userId, message });
      await userNotification.save();
  
      // Save notification for the admin (admin receives all notifications)
      const adminNotification = new Notification({ userId: ADMIN_ID, message });
      await adminNotification.save();
  
      // Send real-time notification to the user
      const userSocketId = onlineUsers.get(userId);
      if (userSocketId) {
        io.to(userSocketId).emit("newNotification", { message });
        console.log(`📢 Sent real-time notification to User ${userId}`);
      } else {
        console.log(`⚠️ User ${userId} is offline, notification saved only in DB.`);
      }
  
      // Send real-time notification to the admin
      const adminSocketId = onlineUsers.get(ADMIN_ID);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newNotification", { message });
        console.log(`📢 Sent real-time notification to Admin`);
      } else {
        console.log(`⚠️ Admin is offline, notification saved only in DB.`);
      }
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  };

// ✅ Add Participant and Notify
export const addParticipant = async (req, res) => {
  try {
    const { id } = req.params; // Session ID
    const { participantId } = req.body;

    const session = await Session.findById(id).populate("specialist participants");
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.participants.includes(participantId)) {
      return res.status(400).json({ error: "Participant already in the session" });
    }

    // Add participant
    session.participants.push(participantId);
    await session.save();

    // 🔍 Fetch Admin ID Automatically
    const admin = await Admin.findOne();
    const adminId = admin ? admin._id : null;

    // 🔔 Send notification to all participants, specialist, and admin
    const notificationMessage = "A new participant has joined the session!";
    const recipients = [session.specialist, ...session.participants, adminId];

    recipients.forEach((user) => {
      if (user) sendNotification(user._id, notificationMessage);
    });

    console.log("📢 Notification Sent: New participant joined.");
    res.status(200).json({ message: "Participant added successfully", session });
  } catch (error) {
    console.error("❌ Error adding participant:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Mark Session as Completed and Notify
export const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id).populate("specialist participants");
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.status = "Completed";
    await session.save();

    // 🔍 Fetch Admin ID Automatically
    const admin = await Admin.findOne();
    const adminId = admin ? admin._id : null;

    // 🔔 Notify all participants, specialist, and admin
    const notificationMessage = "The session has been completed!";
    const recipients = [session.specialist, ...session.participants, adminId];

    recipients.forEach((user) => {
      if (user) sendNotification(user._id, notificationMessage);
    });

    console.log("✅ Session Completed Notification Sent.");
    res.status(200).json({ message: "Session marked as completed", session });
  } catch (error) {
    console.error("❌ Error in completeSession:", error);
    res.status(500).json({ error: "Server error" });
  }
};
