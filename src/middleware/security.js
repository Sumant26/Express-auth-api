import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cors from 'cors';
import config from '../config/config.js';

/**
 * Security Middleware Configuration
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
const apiLimiter = rateLimit({
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
const securityHeaders = helmet({
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
const sanitizeData = [
  // Prevent NoSQL injection
  mongoSanitize(),
  // Prevent XSS attacks
  xss(),
];

/**
 * Setup all security middleware
 * @param {import('express').Application} app 
 */
export const setupSecurity = (app) => {
  // Trust proxy - Important for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Apply security headers
  app.use(securityHeaders);

  // CORS Configuration
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    })
  );

  // Body Parser Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie Parser
  app.use(cookieParser());

  // Data Sanitization
  app.use(sanitizeData);

  // Rate Limiting
  app.use('/api', apiLimiter);
};

