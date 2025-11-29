/**
 * Activity Logger Middleware
 * 
 * Middleware for automatically logging user activities to the database.
 * Creates audit trail entries for security and compliance purposes.
 * 
 * Features:
 * - Logs successful operations (2xx status codes)
 * - Captures user, action, resource, IP, and user agent
 * - Non-blocking (doesn't fail requests if logging fails)
 * - Automatic cleanup of expired logs via MongoDB TTL indexes
 * 
 * Usage:
 *   router.post('/credentials', protect, logActivity('credential_add', 'credential'), handler)
 * 
 * @module middleware/activityLogger
 */

const ActivityLog = require('../models/ActivityLog');

/**
 * Activity Logger Middleware Factory
 * 
 * Creates middleware function that logs user activities after successful operations.
 * Only logs successful responses (2xx status codes).
 * 
 * @param {string} action - Action type (e.g., 'credential_add', 'role_change')
 * @param {string} resourceType - Type of resource being acted upon (e.g., 'credential', 'user')
 * @returns {Function} Express middleware function
 */
const logActivity = (action, resourceType = null) => {
  return async (req, res, next) => {
    // Don't log if user is not authenticated
    if (!req.user) {
      return next();
    }

    // Log after response is sent
    res.on('finish', async () => {
      try {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const resourceId = req.params.credentialId || 
                            req.params.userId || 
                            req.params.divisionId || 
                            req.body.divisionId || 
                            null;

          await ActivityLog.create({
            user: req.user._id,
            action,
            resourceType,
            resourceId,
            details: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          });
        }
      } catch (error) {
        // Don't fail the request if logging fails
        console.error('Activity logging error:', error);
      }
    });

    next();
  };
};

module.exports = logActivity;

