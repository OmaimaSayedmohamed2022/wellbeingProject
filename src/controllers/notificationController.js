import { Notification } from "../models/notificationModel.js";
import { getIo, onlineUsers } from "../config/socketio.js";


export const sendNotification = async (req, res) => {
    try {
        const { senderId, userId, meetingLink, message } = req.body;

        if (!senderId || !userId) {
            return res.status(400).json({ error: "Sender ID and User ID are required." });
        }

        const notification = new Notification({
            senderId,
            userId,
            meetingLink,
            message,
            isRead: false,
        });

        await notification.save();

        // ✅ Ensure io is initialized
        const io = getIo();

        // Check if user is online
        const recipientSocketId = onlineUsers.get(userId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newNotification", {
                senderId,
                meetingLink,
                message,
            });
        }

        res.status(201).json({ message: "Notification sent successfully." });
    } catch (err) {
        console.error("Error sending notification:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
};


