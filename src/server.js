import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import config from './config/config.js';
import database from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import {
  securityHeaders,
  sanitizeData,
  apiLimiter,
} from './middleware/security.js';

/**
 * Express Server Setup
 * 
 * Advanced Features & Best Practices:
 * 1. Environment-based configuration
 * 2. Security middleware (Helmet, rate limiting, sanitization)
 * 3. Request logging (Morgan)
 * 4. Compression for performance
 * 5. CORS configuration
 * 6. Error handling middleware
 * 7. Database connection
 * 8. Route organization
 */

const app = express();

/**
 * Trust proxy - Important for rate limiting behind reverse proxy
 */
app.set('trust proxy', 1);

/**
 * Security Middleware
 * Apply security headers first
 */
app.use(securityHeaders);

/**
 * CORS Configuration
 * Allow cross-origin requests
 */
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

/**
 * Body Parser Middleware
 * Parse JSON and URL-encoded data
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Cookie Parser
 * Parse cookies from requests
 */
app.use(cookieParser());

/**
 * Compression Middleware
 * Compress responses for better performance
 */
app.use(compression());

/**
 * Data Sanitization
 * Prevent NoSQL injection and XSS attacks
 */
app.use(sanitizeData);

/**
 * Request Logging
 * Log HTTP requests (only in development)
 */
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Rate Limiting
 * Apply rate limiting to all routes
 */
app.use('/api', apiLimiter);

/**
 * Health Check Route
 * Simple endpoint to check if server is running
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

/**
 * API Routes
 * All API routes are prefixed with /api
 */
app.use('/api', routes);

/**
 * 404 Handler
 * Handle routes that don't exist
 */
app.use(notFound);

/**
 * Global Error Handler
 * Must be last middleware
 */
app.use(errorHandler);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();

    // Start listening
    const server = app.listen(config.port, () => {
      console.log(`
🚀 Server running in ${config.env} mode
📡 Listening on port ${config.port}
🌐 http://localhost:${config.port}
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Promise Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;

