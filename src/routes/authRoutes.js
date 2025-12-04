import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate, commonValidators } from '../middleware/validation.js';

const router = express.Router();

/**
 * Authentication Routes
 * 
 * Best Practices:
 * 1. Route organization - Group related routes
 * 2. Input validation - Validate before processing
 * 3. Middleware chaining - Multiple middleware functions
 * 4. RESTful naming - Standard REST conventions
 */

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    ...commonValidators.email(),
    ...commonValidators.password(),
    validate,
  ],
  register
);

router.post(
  '/login',
  [
    ...commonValidators.email(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  login
);

router.get('/me', protect, getMe);

router.post('/logout', protect, logout);

export default router;

