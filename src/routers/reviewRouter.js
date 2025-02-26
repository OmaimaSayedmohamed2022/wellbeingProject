import express from 'express';
import { addReview,getReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/add/:id',addReview)
router.get('/gatReviews/:id',getReviews)

export default router;