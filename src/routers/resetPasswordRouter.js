import {
  requestPasswordReset,
  verifyCode,
  resetPassword,
} from "../controllers/resetPasswordController.js";
import express, { Route, Router } from "express";
import { userMiddleware } from "../middlewares/userAuth.js";
const router = express.Router();

router.post("/forget-password", userMiddleware, requestPasswordReset);
router.post("/verify-code", userMiddleware, verifyCode);
router.post("/reset-password", userMiddleware, resetPassword);

export default router;
