import { calPayments, countAdv, countBeneficiary, countCompletedSessions, countGender, countSpecialist, getAllUpcomingSessions, getSessionStatistics, getUsersAtMonth } from "../controllers/adminController.js";
import express from 'express'

const router = express.Router();


router.get('/beneficiary/count', countBeneficiary)
router.get('/beneficiary/countGender',countGender)
router.get('/beneficiary/byMonth',getUsersAtMonth)
router.get('/specialist/count',countSpecialist)



// statistics 
router.get('/stat', getSessionStatistics);
router.get('/all',getAllUpcomingSessions)

router.get('/countComplete',countCompletedSessions)
router.get('/countAdv', countAdv)

router.get('/calcPayments', calPayments)
export default router