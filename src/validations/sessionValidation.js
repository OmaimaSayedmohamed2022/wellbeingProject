import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validationResultMiddleware.js';
export const sessionValidation = [
  // Validate category field
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['mentalHealth', 'physicalHealth', 'skillsDevelopment'])
    .withMessage('Invalid category type'),

  body('subcategory')
    .notEmpty()
    .withMessage('Subcategory is required'),

  body('sessionType')
    .notEmpty()
    .withMessage('Session type is required')
    .isIn(['جلسة فورية', 'جلسة مجانية'])
    .withMessage('Invalid session type'),
    body('sessionDate')
    .notEmpty()
    .withMessage('Session date is required')
    .isISO8601()
    .withMessage('Invalid date'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 300 })
    .withMessage('Description must be at least 10 characters long'),

  validateRequest,
];
