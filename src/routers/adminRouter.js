import express from 'express'

import {countSpecialist,confirmSpecialist,updateSpecialistAvailability,
    getTopSpecialists,getBottomSpecialists,getUnconfirmedSpecialists,
    getSpecialistsAttendanceRate,getAttendanceRate,getSpecialtiesComparison
}from '../controllers/specialistController.js'
import {getAllGroupTherapySessions, getAllSpecialistSessions} from '../controllers/sessionController.js'

import {registerAdmin,getAdminById, countBeneficiary, countGender, calPayments, countAdv, countCompletedSessions,
       getAllUpcomingSessions, getSessionStatistics, getUsersAtMonth ,
       getSessiosBeneficiary,getUpcomingSessions, getBeneficiaryCountForSpecialist,
        getSpecialistEarnings, getAvailableSlotsForSpecialist,
       getSessionStatusRatio, getScheduledSessionsForSpecialist,
        getBeneficiaryReviews,getSessionsCount,getAllBeneficiary,
        getNewBeneficiaries
} from "../controllers/adminController.js";

import { getAllAdv } from '../controllers/advController.js';
import {confirmSessionUpdate} from "../controllers/beneficaryController.js"

const router=express.Router()

router.post('/register',registerAdmin)
router.get('/getAdmin/:id',getAdminById)
//specialist
router.get('/countSpecialist',countSpecialist)
router.get('/beneficiaryCount/:specialistId', getBeneficiaryCountForSpecialist);
router.get('/specialistEarnings/:specialistId', getSpecialistEarnings);
router.get('/availableSlots/:specialistId', getAvailableSlotsForSpecialist);
router.get('/sessionStatusRatio/:specialistId', getSessionStatusRatio);
router.get('/scheduledSessions/:specialistId', getScheduledSessionsForSpecialist);
router.get('/beneficiaryReviews/:specialistId', getBeneficiaryReviews);
router.get('/topSpecialists', getTopSpecialists);
router.get('/bottomSpecialists', getBottomSpecialists);
router.get('/unConfirmed', getUnconfirmedSpecialists);
router.get('/specialistsAttendanceRate', getSpecialistsAttendanceRate);
router.get('/overallAttendanceRate', getAttendanceRate);
router.get('/specialtiesComparison', getSpecialtiesComparison);
router.get('/countSession',getSessionsCount)
router.patch('/confirm/:specialistId', confirmSpecialist);
router.put('/isAvailable/:specialistId', updateSpecialistAvailability);

//sessions
router.get('/countComplete',countCompletedSessions)
router.get('/countAdv', countAdv)
router.get('/calcPayments', calPayments)


// statistics 
router.get('/stat', getSessionStatistics);
router.get('/allUpcomingSessions',getAllUpcomingSessions)

router.patch("/confirmeSessionUpdate/:sessionId",confirmSessionUpdate)
router.get('/Instant/Free',getAllSpecialistSessions)
router.get('/groupTherapy',getAllGroupTherapySessions)



//beneficiary
router.get('/countBeneficiary', countBeneficiary)
router.get('/countGender',countGender)
router.get('/beneficiary/byMonth',getUsersAtMonth)
router.get("/statistics/:id", getSessiosBeneficiary);
router.get("/upcomingSessions/:id", getUpcomingSessions);
router.get("/allBeneficary",getAllBeneficiary)
router.get("/newBeneficary",getNewBeneficiaries)
// router.get("/completedSessions/:id", getCompletedSessions);

router.get('/getAdv',getAllAdv)


export default router