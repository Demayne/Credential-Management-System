const ActivityLog = require('../models/ActivityLog');

// Usage: router.post('/path', protect, logActivity('action_type', 'resource_type'), handler)
const logActivity = (action, resourceType = null) => {
  return async (req, res, next) => {
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
