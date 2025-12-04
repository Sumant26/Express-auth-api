/**
 * Custom Application Error Class
 * 
 * Best Practices:
 * 1. Custom error class - Extends native Error
 * 2. Operational errors - Distinguish from programming errors
 * 3. Status codes - HTTP status codes
 * 4. Error details - Additional context
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

