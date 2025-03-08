import { Notification } from "../models/notificationModel.js";
import { getIo, onlineUsers } from "../config/socketio.js";
import Session from "../models/sessionModel.js";

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

// ✅ Add participant to `Session` and notify
export const addParticipant = async (req, res) => {
  try {
    const { id } = req.params; // Session ID
    const { participantId } = req.body;

    const session = await Session.findById(id).populate("specialist participants");

    if (!session) return res.status(404).json({ error: "Session not found" });

    if (session.participants.includes(participantId)) {
      return res.status(400).json({ error: "Participant already in the session" });
    }

    // Add participant
    session.participants.push(participantId);
    await session.save();

    // ✅ Ensure io is initialized
    const io = getIo();

    // Check if session reached 3 participants
    if (session.participants.length === 3 && session.sessionType === "علاج جماعي") {
      const notificationMessage = `The group session is now ready!`;
      
      // Notify Specialist
      const specialistSocketId = onlineUsers.get(session.specialist._id);
      if (specialistSocketId) {
        io.to(specialistSocketId).emit("newNotification", { message: notificationMessage });
      }

      // Notify Participants
      session.participants.forEach((participant) => {
        const participantSocketId = onlineUsers.get(participant._id);
        if (participantSocketId) {
          io.to(participantSocketId).emit("newNotification", { message: notificationMessage });
        }
      });

      // Save notifications in DB
      const notifications = session.participants.map((participant) => ({
        userId: participant._id,
        message: notificationMessage,
      }));
      notifications.push({ userId: session.specialist._id, message: notificationMessage });

      await Notification.insertMany(notifications);
    }

    res.status(200).json({ message: "Participant added successfully", session });
  } catch (error) {
    console.error("❌ Error adding participant:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Mark session as completed and notify
export const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id).populate("specialist participants");

    if (!session) return res.status(404).json({ error: "Session not found" });

    session.status = "Completed";
    await session.save();

    // ✅ Ensure io is initialized
    const io = getIo();

    const notificationMessage = "The session has been completed!";
    
    // Notify Specialist
    const specialistSocketId = onlineUsers.get(session.specialist._id);
    if (specialistSocketId) {
      io.to(specialistSocketId).emit("newNotification", { message: notificationMessage });
    }

    // Notify Participants
    session.participants.forEach((participant) => {
      const participantSocketId = onlineUsers.get(participant._id);
      if (participantSocketId) {
        io.to(participantSocketId).emit("newNotification", { message: notificationMessage });
      }
    });

    // Save notifications in DB
    const notifications = session.participants.map((participant) => ({
      userId: participant._id,
      message: notificationMessage,
    }));
    notifications.push({ userId: session.specialist._id, message: notificationMessage });

    await Notification.insertMany(notifications);

    res.status(200).json({ message: "Session marked as completed", session });
  } catch (error) {
    console.error("❌ Error in completeSession:", error);
    res.status(500).json({ error: "Server error" });
  }
};
