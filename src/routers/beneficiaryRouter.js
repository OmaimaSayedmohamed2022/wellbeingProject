// routes/beneficiaryRoutes.js
import express from 'express';
import { createBeneficiary,deleteBeneficiary,getBeneficiaryById, updateBeneficiary } from '../controllers/beneficaryController.js';
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
router.patch('/update/:id', updateBeneficiary)
router.delete('/delete/:id',deleteBeneficiary)

export default router;
