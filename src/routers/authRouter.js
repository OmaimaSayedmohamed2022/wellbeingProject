import express from 'express';
import { loginUser } from '../controllers/authController.js';
import { loginValidation } from '../validations/loginValidation.js';

const router = express.Router();

// Route Beneficiary
router.post(
  '/login',
 loginValidation,
  loginUser
)


export default router;