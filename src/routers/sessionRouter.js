import express from 'express';
import { 
    getSessions,
  getScheduledSessions,
  getCompletedSessions,
  getBeneficiarySessions,
  getSpecialistSessions,
  getSessionTypes,
  createSession,
  updateSessionStatus,
  getSessionById
} from '../controllers/sessionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { sessionMiddleware } from '../middlewares/sessionMiddleware.js';
const router = express.Router();

// Route to fetch session types
router.get('/types', getSessionTypes);

router.post('/create', verifyToken , sessionMiddleware , createSession)
router.get("/:id",getSessionById)
// router.post('/payment',processPayment)

router.get("/", getSessions);
router.get("/scheduled", getScheduledSessions);
router.get("/completed", getCompletedSessions);

router.get("/beneficiary/:beneficiaryId", getBeneficiarySessions);  

router.get("/specialist/:specialistId", getSpecialistSessions);     

router.patch("/update/:sessionId", updateSessionStatus)

export default router;
