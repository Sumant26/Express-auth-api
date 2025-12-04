import { validationResult, body } from 'express-validator';
import { AppError } from '../utils/AppError.js';

/**
 * Validation Middleware
 * 
 * Best Practices:
 * 1. Centralized validation - Use express-validator
 * 2. Error formatting - Consistent error responses
 * 3. Early validation - Validate before processing
 * 4. Custom validators - Complex validation logic
 */

/**
 * Check validation results
 * Returns formatted errors if validation fails
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return next(
      new AppError('Validation failed', 400, {
        errors: errorMessages,
      })
    );
  }

  next();
};

/**
 * Validation rules for common fields
 */
export const commonValidators = {
  email: (field = 'email') => [
    body(field).trim().isEmail().withMessage('Invalid email address'),
  ],
  password: (field = 'password') => [
    body(field)
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  mongoId: (field = 'id') => [
    body(field).isMongoId().withMessage('Invalid ID format'),
  ],
};

