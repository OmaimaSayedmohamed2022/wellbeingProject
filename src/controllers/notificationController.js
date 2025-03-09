import { Notification } from "../models/notificationModel.js";
import { getIo, onlineUsers } from "../config/socketio.js";

const ADMIN_ID = "67a7ed1765eebdbbbc6982f7"; // ✅ Admin's User ID

export const sendNotification = async (req, res) => {
    try {
        const { senderId, userId, meetingLink, message } = req.body;

        if (!senderId || !userId) {
            return res.status(400).json({ error: "Sender ID and User ID are required." });
        }

        const io = getIo(); // ✅ Ensure io is initialized

        // ✅ Create and save notification for the recipient
        const notification = new Notification({
            senderId,
            userId,
            meetingLink,
            message,
            isRead: false,
        });
        await notification.save();

        // ✅ Also send a notification to the admin
        const adminNotification = new Notification({
            senderId,
            userId: ADMIN_ID, // ✅ Admin receives all notifications
            meetingLink,
            message,
            isRead: false,
        });
        await adminNotification.save();

        // ✅ Send real-time notification to the recipient if online
        const recipientSocketId = onlineUsers.get(userId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newNotification", {
                senderId,
                meetingLink,
                message,
            });
            console.log(`📢 Sent real-time notification to User ${userId}`);
        } else {
            console.log(`⚠️ User ${userId} is offline, notification saved only in DB.`);
        }

        // ✅ Send real-time notification to the admin if online
        const adminSocketId = onlineUsers.get(ADMIN_ID);
        if (adminSocketId) {
            io.to(adminSocketId).emit("newNotification", {
                senderId,
                meetingLink,
                message,
            });
            console.log(`📢 Sent real-time notification to Admin.`);
        } else {
            console.log(`⚠️ Admin is offline, notification saved only in DB.`);
        }

        res.status(201).json({ message: "Notification sent successfully." });
    } catch (err) {
        console.error("❌ Error sending notification:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
};
