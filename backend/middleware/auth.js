/**
 * Authentication Middleware
 * 
 * Provides authentication and authorization middleware functions for Express routes.
 * Implements JWT-based authentication, role-based access control (RBAC), and division access checks.
 * 
 * Functions:
 * - protect: Verifies JWT token and attaches user to request
 * - authorize: Checks if user has required role(s)
 * - checkDivisionAccess: Verifies user has access to specific division
 * 
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect Route Middleware
 * 
 * Verifies JWT token from Authorization header and attaches authenticated user to request.
 * Checks if user account is active and not locked.
 * Populates user's divisions and organizationalUnits for access checks.
 * 
 * Usage: router.get('/protected-route', protect, handler)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id)
      .select('-password')
      .populate('divisions', '_id')
      .populate('organizationalUnits', '_id');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * 
 * Checks if the authenticated user has one of the required roles.
 * Must be used after protect middleware (requires req.user).
 * 
 * Usage: router.get('/admin-route', protect, authorize('admin'), handler)
 *        router.get('/admin-or-manager', protect, authorize('admin', 'management'), handler)
 * 
 * @param {...string} roles - One or more allowed roles ('user', 'management', 'admin')
 * @returns {Function} Express middleware function
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Division Access Check Middleware
 * 
 * Verifies that the authenticated user has access to the specified division.
 * Admins have access to all divisions automatically.
 * Regular users must be assigned to the division to access it.
 * 
 * Division ID can be provided in:
 * - URL params: /api/repositories/:divisionId
 * - Request body: req.body.divisionId
 * 
 * Usage: router.get('/repositories/:divisionId', protect, checkDivisionAccess, handler)
 * 
 * @param {Object} req - Express request object (must have req.user from protect middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
exports.checkDivisionAccess = async (req, res, next) => {
  try {
    const divisionId = req.params.divisionId || req.body.divisionId;
    
    if (!divisionId) {
      return res.status(400).json({
        success: false,
        message: 'Division ID is required'
      });
    }

    // Admin has access to all divisions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user is assigned to this division
    // Handle both ObjectId and populated division objects
    const hasAccess = req.user.divisions.some(
      div => {
        const divId = div._id ? div._id.toString() : div.toString();
        return divId === divisionId.toString();
      }
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this division'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking division access'
    });
  }
};

