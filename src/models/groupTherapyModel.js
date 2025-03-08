import mongoose from "mongoose";

const groupTherapySchema = new mongoose.Schema({
  sessionType: { 
    type: String, 
    enum: ["علاج جماعي"], 
    required: true 
  },
  specialist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Specialist", 
    required: true 
  },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Beneficiary" }
  ],
  maxParticipants: { type: Number, default: 3 },
  meetingLink: { type: String }, 
  isGroupReady: { type: Boolean, default: false },
  sessionDate: { type: Date, required: true },
  description: { type: String }
}, { timestamps: true });

const GroupTherapy = mongoose.model("GroupTherapy", groupTherapySchema);
export default GroupTherapy;
