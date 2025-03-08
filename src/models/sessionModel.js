import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionType: {
      type: String,
      required: true,
      enum: ["Instant Session", "Free Session", "Regular Session", "Group Therapy"],
    },
    category: {
      type: String,
      required: true,
      enum: ["mentalHealth", "physicalHealth", "skillsDevelopment"],
    },
    subcategory: {
      type: String,
      required: function () {
        return ["mentalHealth"].includes(this.category);
      },
    },
    description: {
      type: String,
      required: true,
      maxlength: 300,
    },
    sessionDate: {
      type: Date,
      required: function () {
        return this.sessionType !== "Group Therapy"; // Group therapy does not require a date
      },
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Canceled", "Requested", "Pending"],
      default: "Pending",
    },
    beneficiary: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Beneficiary",
      },
    ], // Supports multiple participants for group therapy
    specialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialist",
      required: function () {
        return this.sessionType === "Regular Session"; // Required for regular sessions
      },
    },
    maxParticipants: {
      type: Number,
      default: function () {
        return this.sessionType === "Group Therapy" ? 3 : 1; // Default max for group therapy
      },
    },
    meetingLink: { type: String },
    isGroupReady: { type: Boolean, default: false }, 
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Paid",
    },
    paymentDetails: {
      transactionId: String,
      amount: Number,
      method: String, // Visa, MasterCard, Audi Bank, etc.
    },
    requestedDate: { type: Date },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
