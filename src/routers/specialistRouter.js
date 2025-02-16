import express from 'express';
import { registerSpecialist,getSpecialistsByCategory,getSpecialistById, updateSpecialist, deleteSpecialist, addAvailableSlot, deleteAvailableSlot } from '../controllers/specialistController.js';
import { specialistValidation } from '../validations/specialistValidation.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';

const router = express.Router();

// Route to register a specialist
router.post('/register',
    uploadFiles,
    specialistValidation ,
     registerSpecialist);
     
router.get('/getByCategory',getSpecialistsByCategory)
router.get('/getById/:id',getSpecialistById)
router.put('/update/:id',updateSpecialist)
router.delete('/delete/:id',deleteSpecialist)
router.put('/addSlots/:id',addAvailableSlot)
router.delete('/deleteSlots/:id',deleteAvailableSlot)

export default router;