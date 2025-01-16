// routes/beneficiaryRoutes.js
import express from 'express';
import { addImageBeneficiary, createBeneficiary,deleteBeneficiary,getBeneficiaryById, updateBeneficiary } from '../controllers/beneficaryController.js';
import { beneficiaryValidation } from '../validations/beneficiaryValidation.js';

const router = express.Router();

// Route Beneficiary
router.post(
  '/register/beneficiary',
  beneficiaryValidation(false),
  createBeneficiary
)

router.patch(
  '/addImage/:id',
addImageBeneficiary
)
router.get(
  '/beneficiary/:id',
   getBeneficiaryById);


router.patch('/update/:id',beneficiaryValidation(true), updateBeneficiary)
router.delete('/delete/:id',deleteBeneficiary)

export default router;
