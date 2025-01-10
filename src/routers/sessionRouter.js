import express from 'express';
import { getSessionTypes, submitSession } from '../controllers/sessionController.js';

const router = express.Router();

// Route to fetch session types
router.get('/', getSessionTypes);

// Route to submit session details
router.post('/submit', submitSession);

export default router;
