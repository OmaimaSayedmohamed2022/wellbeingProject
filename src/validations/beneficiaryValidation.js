import { body } from "express-validator";
import { validateRequest } from "../middlewares/validationResultMiddleware.js";
import { Beneficiary } from "../models/beneficiaryModel.js";

export const beneficiaryValidation = (isUpdate = false) => [
  body("region")
    .if(() => !isUpdate) // Required for registration only
    .notEmpty()
    .withMessage("Region is required"),
  body("firstName")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("First name is required"),
  body("lastName")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Last name is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value, { req }) => {
      if (isUpdate) {
        // For updates, skip duplicate check if email remains unchanged
        const beneficiary = await Beneficiary.findById(req.params.id);
        if (!beneficiary) throw new Error("Beneficiary not found");
        if (value === beneficiary.email) return true; // No duplicate check if unchanged
      }
      const existingBeneficiary = await Beneficiary.findOne({ email: value });
      if (existingBeneficiary) throw new Error("Email already registered");
      return true;
    }),
  body("password")
    .if(() => !isUpdate) // Required for registration only
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("phone")
    .if(() => !isUpdate)
    .isMobilePhone()
    .withMessage("Enter a valid phone number"),
  body("profession")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Profession is required"),
  body("age")
    .if(() => !isUpdate)
    .isInt({ min: 18 })
    .withMessage("Age must be a number greater than 18"),
  body("nationality")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Nationality is required"),
  body("homeAddress")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Home address is required"),
  body("gender")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["male", "female"])
    .withMessage("Gender must be one of 'male', 'female'"),
  validateRequest,
];
