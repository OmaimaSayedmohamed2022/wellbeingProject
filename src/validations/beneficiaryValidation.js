import { body } from "express-validator";
import { validateRequest } from "../middlewares/validationResultMiddleware.js";
import { Beneficiary } from "../models/beneficiaryModel.js";

export const beneficiaryValidation = [
  body("region").notEmpty().withMessage("region is required"),
  body("firstName").notEmpty().withMessage("firstName is required"),
  body("lastName").notEmpty().withMessage("lastName is required"),
  body("email")
  .isEmail()
  .withMessage("Invalid email format")
  .custom(async (value, { req }) => {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) {
      throw new Error("Beneficiary not found");
    }
    // Check if the new email is different from the current one
    if (value !== beneficiary.email) {
      const existingBeneficiary = await Beneficiary.findOne({ email: value });
      if (existingBeneficiary) {
        throw new Error("Email already registered");
      }
    }
    return true;
  }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("phone").isMobilePhone().withMessage("Enter a valid phone number"),
  body("profession").notEmpty().withMessage("Profession is required"),
  body("age")
    .isInt({ min: 18 })
    .withMessage("Age must be a number greater than 18"),
  body("nationality").notEmpty().withMessage("Nationality is required"),
  body("homeAddress").notEmpty().withMessage("Home address is required"),
  body("gender")
        .notEmpty()
        .withMessage("gender is required.")
        .isIn(["male", "female"])
        .withMessage("gender must be one of 'Male', 'Female'"),
  validateRequest,
];
