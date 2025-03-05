// routes/beneficiaryRoutes.js
import express from 'express';
import { addImageToUser, createBeneficiary,deleteBeneficiary,getBeneficiaryById, 
  updateBeneficiary,getBeneficiarySessions, 
  requestSessionDateUpdate} from '../controllers/beneficaryController.js';
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
addImageToUser
)
router.get(
  '/beneficiary/:id',
   getBeneficiaryById);

router.get('/sessions/:id',getBeneficiarySessions)

router.patch('/update/:id',beneficiaryValidation(true), updateBeneficiary)
router.delete('/delete/:id',deleteBeneficiary)

router.patch("/updateSessionDate/:beneficiaryId/:sessionId",requestSessionDateUpdate)

export default router;
