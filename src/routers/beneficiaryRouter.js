// routes/beneficiaryRoutes.js
import express from 'express';
import { createBeneficiary,getBeneficiaryById } from '../controllers/beneficaryController.js';
import { beneficiaryValidation } from '../validations/beneficiaryValidation.js';

const router = express.Router();

// Route Beneficiary
router.post(
  '/register/beneficiary',
  beneficiaryValidation,
  createBeneficiary
)

router.get(
  '/beneficiary/:id',
   getBeneficiaryById);

export default router;
