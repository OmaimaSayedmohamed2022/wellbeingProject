import express from 'express';
import { addTreatmentProgram, getTreatmentProgram } from '../controllers/treatmentProgramController.js';

const router = express.Router();

router.post('/add', addTreatmentProgram);

router.get('/', getTreatmentProgram);

export default router;