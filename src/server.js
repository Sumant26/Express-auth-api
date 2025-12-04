import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import config from './config/config.js';
import database from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { setupSecurity } from './middleware/security.js';
import logger from './utils/logger.js';

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
 * Setup Security Middleware
 * Handles:
 * - Trust Proxy
 * - Helmet (Security Headers)
 * - CORS
 * - Body Parsing (JSON, URL-encoded)
 * - Cookie Parsing
 * - Data Sanitization (NoSQL, XSS)
 * - Rate Limiting
 */
setupSecurity(app);

/**
 * Compression Middleware
 * Compress responses for better performance
 */
app.use(compression());

/**
 * Request Logging
 * Log HTTP requests (only in development)
 */
const morganFormat = config.env === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

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
      logger.info(`Server running in ${config.env} mode`);
      logger.info(`Listening on port ${config.port}`);
      logger.info(`http://localhost:${config.port}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;

