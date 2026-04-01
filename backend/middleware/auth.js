const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request. Rejects inactive accounts.
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
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Role-based access control. Use after protect middleware.
// Usage: authorize('admin') or authorize('admin', 'management')
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

// Verify the authenticated user has access to the requested division.
// Admins bypass this check. Division ID read from params or body.
exports.checkDivisionAccess = async (req, res, next) => {
  try {
    const divisionId = req.params.divisionId || req.body.divisionId;

    if (!divisionId) {
      return res.status(400).json({
        success: false,
        message: 'Division ID is required'
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const hasAccess = req.user.divisions.some(div => {
      const divId = div._id ? div._id.toString() : div.toString();
      return divId === divisionId.toString();
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this division'
      });
    }

    next();
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Error checking division access'
    });
  }
};
