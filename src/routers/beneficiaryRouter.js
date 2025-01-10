// routes/beneficiaryRoutes.js
import express from 'express';
import { createBeneficiary } from '../controllers/beneficaryController.js';
import { beneficiaryValidation } from '../validations/beneficiaryValidation.js';

const router = express.Router();

// Route Beneficiary
router.post(
  '/register/beneficiary',
  beneficiaryValidation,
  createBeneficiary
)


export default router;
