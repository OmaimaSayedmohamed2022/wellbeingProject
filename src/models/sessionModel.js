import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['mentalHealth', 'physicalHealth', 'skillsDevelopment'], 
    },
    subcategory: {
      type: String,
      required: true,
      
    },
    sessionType: {
      type: String,
      required: true,
      enum: ['جلسة فورية', 'جلسة مجانية'],
    },
    description: {
      type: String,
      required: true,
      maxlength: 300,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } 
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
