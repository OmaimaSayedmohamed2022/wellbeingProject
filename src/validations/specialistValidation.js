import { body } from "express-validator";
import { validateRequest } from "../middlewares/validationResultMiddleware.js";
import Specialist from "../models/specialistModel.js";

export const specialistValidation = [
  body("firstName").notEmpty().withMessage("firstName is required"),
  body("lastName").notEmpty().withMessage("lastName is required"),
  body("email")
  .isEmail()
  .withMessage("Invalid email format")
  .custom(async (value) => {
    const existingSpecialist = await Specialist.findOne({ email: value });
    if (existingSpecialist) {
      throw new Error("Email already registered");
    }
    return true;
  }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("phone").isMobilePhone().withMessage("Enter a valid phone number"),
  body("nationality").notEmpty().withMessage("Nationality is required"),
  body("work").notEmpty().withMessage("Work is required"),
  body("workAddress").notEmpty().withMessage("Work address is required"),
  body("homeAddress").notEmpty().withMessage("Home address is required"),
  body("bio").notEmpty().withMessage("Bio is required"),
  body("sessionPrice")
    .isNumeric()
    .withMessage("Session price must be a number"),
  body("yearsExperience")
    .isNumeric()
    .withMessage("Years of experience must be a number"),
  body("sessionDuration")
    .isNumeric()
    .withMessage("Session duration must be a number"),
  validateRequest,
];
