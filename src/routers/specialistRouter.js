import express from 'express';
import { registerSpecialist,getSpecialistsByCategory, getAllSpecialists,getSpecialistById,
    updateSpecialist,deleteSpecialist,addAvailableSlot,deleteAvailableSlot,updateLanguage
       } from '../controllers/specialistController.js';
import { specialistValidation } from '../validations/specialistValidation.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';
import {userMiddleware} from '../middlewares/userAuth.js'

const router = express.Router();


router.get('/getAll', getAllSpecialists);

router.post('/register', uploadFiles, specialistValidation, registerSpecialist);
router.get('/getByCategory', getSpecialistsByCategory);
router.get('/getById/:id', getSpecialistById);
router.patch('/update/:id',updateSpecialist)
router.delete('/delete/:id',deleteSpecialist)
router.post('/addSlots/:id',addAvailableSlot)
router.delete('/deleteSlots/:id',deleteAvailableSlot)

router.patch("/updateLanguage/:id", updateLanguage);


export default router;


