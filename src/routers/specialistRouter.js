import express from 'express';
import { registerSpecialist,getSpecialistsByCategory } from '../controllers/specialistController.js';
import { specialistValidation } from '../validations/specialistValidation.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';

const router = express.Router();

// Route to register a specialist
router.post('/register',
    uploadFiles,
    specialistValidation ,
     registerSpecialist);
     
router.get('/getByCategory',getSpecialistsByCategory)

export default router;