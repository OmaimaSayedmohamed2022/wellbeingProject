import Review from '../models/reviewModel.js';
import Specialist from '../models/specialistModel.js';


// Submit a review
export const addReview= async (req, res) => {
  const { id } = req.params; // Specialist ID
  const { beneficiary, rating, comment } = req.body;
  
  const specialist = await Specialist.findById(id);
if (!specialist) {
  return res.status(404).json({ error: 'Specialist not found' });
}
  try {
    const review = new Review({
      beneficiary,
      specialist: id,
      rating,
      comment,
    });

    // Save the review
    await review.save();

    // Add the review to the specialist's reviews array
    specialist.reviews.push(review._id);
    await specialist.save();

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Failed to submit review',error:error.message });
  }
}

export const getReviews = async (req, res) => {
  const { id } = req.params; // Specialist ID

  try {
    const specialist = await Specialist.findById(id).populate('reviews');
    res.status(200).json({ reviews: specialist.reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

