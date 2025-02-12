import express from 'express';
import beneficiaryRouter from './beneficiaryRouter.js';
import authRouter from './authRouter.js';
import specialistRouter from './specialistRouter.js';
import resetPasswordRouter from './resetPasswordRouter.js';
import categoriesRouter from './categoriesRouter.js';
import sessionRouter from './sessionRouter.js';
import adminRouter from './adminRouter.js';
import advRouter from './advRouters.js';
import TreatmentProgram from '../routers/treatmentProgramRouter.js';
import { authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use('/beneficiaries', beneficiaryRouter);
router.use('/auth', authRouter);
router.use('/specialist', specialistRouter);
router.use('/resetPassword', resetPasswordRouter);
router.use('/categories', categoriesRouter);
router.use('/sessions', sessionRouter);
router.use('/admin', authorizeRole(['admin']),adminRouter)
router.use('/adv',advRouter)
router.use('/treatment',TreatmentProgram)

export default router;