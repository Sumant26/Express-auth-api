import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import config from '../config/config.js';

/**
 * Security Middleware
 * 
 * Best Practices:
 * 1. Helmet - Set security HTTP headers
 * 2. Rate limiting - Prevent brute force attacks
 * 3. Data sanitization - Prevent NoSQL injection
 * 4. XSS protection - Prevent cross-site scripting
 * 5. CORS - Control cross-origin requests
 */

/**
 * Rate limiting for general API
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiting for auth routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

/**
 * Security headers with Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Data sanitization
 */
export const sanitizeData = [
  // Prevent NoSQL injection
  mongoSanitize(),
  // Prevent XSS attacks
  xss(),
];

