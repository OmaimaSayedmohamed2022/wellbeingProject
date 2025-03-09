import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: {type:String},
  senderId:{type: mongoose.Schema.Types.ObjectId,ref:"Specialist",required:false},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "Beneficiary" ,required:false},
  createdAt: {type: Date, default: Date.now },
  meetingLink:{type:String},
  isRead:{default :false , type: Boolean}
});

export const Notification = mongoose.model("Notification", notificationSchema);