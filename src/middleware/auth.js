import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

/**
 * Authentication Middleware
 * 
 * Best Practices:
 * 1. Token verification - Verify JWT tokens
 * 2. User lookup - Fetch user from database
 * 3. Role-based access - Check user roles
 * 4. Error handling - Proper error responses
 * 5. Async handling - Use asyncHandler wrapper
 */

/**
 * Protect routes - Verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new AppError('User no longer exists', 401));
    }

    if (!req.user.isActive) {
      return next(new AppError('User account is inactive', 401));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

/**
 * Role-based authorization
 * Restrict access to specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Optional authentication
 * Attach user if token exists, but don't require it
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore errors for optional auth
    }
  }

  next();
});

