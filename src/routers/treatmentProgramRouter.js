import express from 'express';
import { addTreatmentProgram, getTreatmentProgram, getTreatmentProgramByName } from '../controllers/treatmentProgramController.js';

const router = express.Router();

router.post('/add', addTreatmentProgram);
router.get('/', getTreatmentProgram);
router.get("/:name", getTreatmentProgramByName);

export default router;