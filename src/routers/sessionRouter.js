import express from 'express';
import { getSessionTypes ,createSession} from '../controllers/sessionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to fetch session types
router.get('/', getSessionTypes);

router.post('/create',verifyToken,createSession)
// router.post('/payment',processPayment)

export default router;
