import mongoose from "mongoose";

const treatmentProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    importance: { type: String, required: true, trim: true },
    treatmentPlan: { type: String, required: true, trim: true },
    goals: { type: String, required: true, trim: true },
    stages: { type: [String], default: [], trim: true },
    techniques: { type: [String], default: [], trim: true },
    skillTraining: { type: [String], default: [], trim: true },
  },
  { timestamps: true }
);

const TreatmentProgram = mongoose.model("TreatmentProgram", treatmentProgramSchema);
export default TreatmentProgram;
