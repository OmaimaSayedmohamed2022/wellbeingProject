import express from 'express';
import { registerSpecialist } from '../controllers/specialistController.js';
import { specialistValidation } from '../validations/specialistValidation.js';
import { uploadFiles } from '../controllers/photoController.js';

const router = express.Router();

// Route to register a specialist
router.post('/register',
    uploadFiles,
    specialistValidation ,
     registerSpecialist);

export default router;