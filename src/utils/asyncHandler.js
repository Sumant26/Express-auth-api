/**
 * Async Handler Utility
 * 
 * Best Practice:
 * Wraps async route handlers to automatically catch errors
 * and pass them to error handling middleware
 * 
 * Instead of:
 *   app.get('/route', async (req, res, next) => {
 *     try {
 *       // async code
 *     } catch (error) {
 *       next(error);
 *     }
 *   });
 * 
 * You can write:
 *   app.get('/route', asyncHandler(async (req, res, next) => {
 *     // async code - errors automatically caught
 *   }));
 */

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

