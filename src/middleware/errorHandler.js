import config from '../config/config.js';
import { AppError } from '../utils/AppError.js';

/**
 * Global Error Handler Middleware
 * 
 * Best Practices:
 * 1. Centralized error handling - All errors go through here
 * 2. Error classification - Different handling for different error types
 * 3. Development vs Production - Different error details
 * 4. Logging - Log errors for debugging
 * 5. Consistent format - Standardized error responses
 */

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB cast errors (invalid ObjectId, etc.)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational errors: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }
  // Programming errors: don't leak error details
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.isDevelopment) {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB errors
    if (err.name === 'MongoServerError' && err.code === 11000) {
      error = handleDuplicateKeyError(err);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }
    if (err.name === 'CastError') {
      error = handleCastError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

