import express from 'express';
import { getSessionTypes ,createSession, countSessions} from '../controllers/sessionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { sessionMiddleware } from '../middlewares/sessionMiddleware.js';

const router = express.Router();

// Route to fetch session types
router.get('/', getSessionTypes);

router.post('/create', verifyToken , sessionMiddleware , createSession)
// router.post('/payment',processPayment)
router.get('/count', countSessions)
export default router;
