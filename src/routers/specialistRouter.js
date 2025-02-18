import express from 'express';
import { registerSpecialist,getSpecialistsByCategory, getAllSpecialists,getSpecialistById,
    updateSpecialist,deleteSpecialist,addAvailableSlot,deleteAvailableSlot
 }
    // getSpecialistsAttendanceRate, getAttendanceRate, getSpecialtiesComparison,
    //  searchSpecialists, confirmSpecialist,
    // updateSpecialistAvailability, } 
    from '../controllers/specialistController.js';
import { specialistValidation } from '../validations/specialistValidation.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';

const router = express.Router();
// const adminRouter = express.Router()


router.get('/getAll', getAllSpecialists);

router.post('/register', uploadFiles, specialistValidation, registerSpecialist);
router.get('/getByCategory', getSpecialistsByCategory);
router.get('/getById/:id', getSpecialistById);
router.patch('/update/:id',updateSpecialist)
router.delete('/delete/:id',deleteSpecialist)
router.post('/addSlots/:id',addAvailableSlot)
router.delete('/deleteSlots/:id',deleteAvailableSlot)

export default router;

