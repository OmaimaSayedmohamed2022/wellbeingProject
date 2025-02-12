import express from 'express';
import { isTokenValid, loginUser, logOutUser,  } from '../controllers/authController.js';
import { loginValidation } from '../validations/loginValidation.js';

const router = express.Router();

// Route Beneficiary
router.post(
  '/login',
 loginValidation,
  loginUser
)

router.post('/logout',
  isTokenValid ,
  logOutUser
)

export default router;