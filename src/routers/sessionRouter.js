import express from 'express';
import { 
  getBeneficiarySessions,
  getSpecialistSessions,
  getSessionTypes,
  createSession,
  updateSessionStatus,
  getSessionById,
  updatePendingToScheduled,
 getSessionsByStatus,
 cancelSession
} from '../controllers/sessionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { sessionMiddleware } from '../middlewares/sessionMiddleware.js';
const router = express.Router();

// Route to fetch session types
router.get('/types', getSessionTypes);

router.post('/create', verifyToken , sessionMiddleware , createSession)
router.get("/:id",getSessionById)
// router.post('/payment',processPayment)


router.put("/cancel/:id",cancelSession)

router.get('/status/:status',getSessionsByStatus)


router.get("/beneficiary/:beneficiaryId", getBeneficiarySessions);  

router.get("/specialist/:specialistId", getSpecialistSessions);     

router.patch("/update/:sessionId", updateSessionStatus),
router.patch("/update/pendingToScheduled/:sessionId",updatePendingToScheduled)

export default router;
