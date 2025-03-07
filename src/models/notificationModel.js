import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  isRead:{default :false , type: Boolean}
});

export const Notification = mongoose.model("Notification", notificationSchema);
