import { body } from "express-validator";
import { validateRequest } from "../middlewares/validationResultMiddleware.js";


export const loginValidation = [
  body("email").isEmail().withMessage("A valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  validateRequest,
];
