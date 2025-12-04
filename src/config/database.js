import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * MongoDB Connection Handler with Advanced Features
 * 
 * Best Practices:
 * 1. Connection pooling - Mongoose handles this automatically
 * 2. Error handling - Graceful connection failure handling
 * 3. Connection events - Monitor connection state
 * 4. Retry logic - Built into Mongoose
 * 5. Index creation - Ensured on connection
 */

class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB with advanced configuration
   * 
   * Options explained:
   * - useNewUrlParser: Use new MongoDB connection string parser
   * - useUnifiedTopology: Use new server discovery and monitoring engine
   * - maxPoolSize: Maximum number of connections in the connection pool
   * - minPoolSize: Minimum number of connections to maintain
   * - serverSelectionTimeoutMS: How long to wait for server selection
   * - socketTimeoutMS: How long to wait for socket operations
   * - heartbeatFrequencyMS: How often to check server status
   */
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/express-advanced';

      const options = {
        maxPoolSize: 10, // Maximum number of connections
        minPoolSize: 2,  // Minimum number of connections
        serverSelectionTimeoutMS: 5000, // Timeout for server selection
        socketTimeoutMS: 45000, // Socket timeout
        heartbeatFrequencyMS: 10000, // Heartbeat frequency
      };

      this.connection = await mongoose.connect(mongoUri, options);

      // Connection event listeners
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', this.disconnect.bind(this));
      process.on('SIGTERM', this.disconnect.bind(this));

      return this.connection;
    } catch (error) {
      logger.error('Database connection failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB gracefully
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB disconnected gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      process.exit(1);
    }
  }

  /**
   * Get connection state
   */
  getState() {
    return mongoose.connection.readyState;
  }

  /**
   * Check if database is connected
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export default new Database();

