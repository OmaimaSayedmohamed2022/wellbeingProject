import mongoose from 'mongoose';


const reviewSchema = new mongoose.Schema({
  beneficiary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beneficiary', // Reference to the Beneficary model
    required: true,
  },
  specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialist', // Reference to the Specialist model
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;