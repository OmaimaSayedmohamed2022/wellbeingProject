import express from 'express';
import { registerSpecialist,getSpecialistsByCategory, getAllSpecialists,
    getSpecialistsAttendanceRate, getAttendanceRate, getSpecialtiesComparison,
    getTopSpecialists, getBottomSpecialists, searchSpecialists, confirmSpecialist,
    updateSpecialistAvailability, getUnconfirmedSpecialists, getSpecialistById } 
    from '../controllers/specialistController.js';
import { specialistValidation } from '../validations/specialistValidation.js';
import { verifyToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';

const router = express.Router();
const adminRouter = express.Router();

adminRouter.get('/getAll', getAllSpecialists);
adminRouter.get('/search', searchSpecialists);
adminRouter.get('/topSpecialists', getTopSpecialists);
adminRouter.get('/bottomSpecialists', getBottomSpecialists);
adminRouter.get('/unConfirmed', getUnconfirmedSpecialists);
adminRouter.get('/specialistsAttendanceRate', getSpecialistsAttendanceRate);
adminRouter.get('/overallAttendanceRate', getAttendanceRate);
adminRouter.get('/specialtiesComparison', getSpecialtiesComparison);
adminRouter.patch('/confirm/:specialistId', confirmSpecialist);
adminRouter.put('/isAvailable/:specialistId', updateSpecialistAvailability);

router.use('/admin', authorizeRole(['admin']), adminRouter);

router.post('/register', uploadFiles, specialistValidation, registerSpecialist);
router.get('/getByCategory', getSpecialistsByCategory);
router.get('/getById/:id', getSpecialistById);

export default router;
