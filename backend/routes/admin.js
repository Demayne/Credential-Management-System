/**
 * Admin Routes
 * 
 * Handles all administrative operations requiring admin role.
 * All routes are protected and require admin authentication.
 * 
 * Endpoints:
 * - GET /api/admin/users - List all users (paginated, filtered)
 * - PUT /api/admin/users/:userId/role - Change user role
 * - POST /api/admin/users/:userId/assignments - Assign user to OU/division
 * - DELETE /api/admin/users/:userId/assignments - Remove user from OU/division
 * - GET /api/admin/organizational-structure - Get full OU/division hierarchy
 * 
 * Security:
 * - All routes require admin role
 * - Activity logging for all admin operations
 * - Input validation on all endpoints
 * 
 * @module routes/admin
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OrganizationalUnit = require('../models/OrganizationalUnit');
const Division = require('../models/Division');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

/**
 * Admin Route Protection
 * 
 * All routes in this file require:
 * 1. Valid JWT token (protect middleware)
 * 2. Admin role (authorize('admin') middleware)
 */
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users (paginated, filtered)
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('organizationalUnits', 'name code')
      .populate('divisions', 'name code')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users/:userId
// @desc    Get specific user details
// @access  Private (Admin only)
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('organizationalUnits', 'name code description')
      .populate('divisions', 'name code organizationalUnit');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:userId/role
// @desc    Change user role
// @access  Private (Admin only)
router.put('/users/:userId/role', [
  body('role').isIn(['user', 'management', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const oldRole = user.role;
    user.role = req.body.role;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'role_change',
      resourceType: 'user',
      resourceId: user._id,
      details: {
        targetUser: user.username,
        oldRole: oldRole,
        newRole: req.body.role
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users/:userId/assignments
// @desc    Assign user to OU/division
// @access  Private (Admin only)
router.post('/users/:userId/assignments', [
  body('organizationalUnits').optional().isArray(),
  body('divisions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate and assign organizational units
    if (req.body.organizationalUnits) {
      const ous = await OrganizationalUnit.find({
        _id: { $in: req.body.organizationalUnits }
      });
      
      if (ous.length !== req.body.organizationalUnits.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more organizational units not found'
        });
      }

      // Merge with existing OUs (avoid duplicates)
      const newOUs = [...new Set([...user.organizationalUnits.map(ou => ou.toString()), ...req.body.organizationalUnits])];
      user.organizationalUnits = newOUs;
    }

    // Validate and assign divisions
    if (req.body.divisions) {
      const divisions = await Division.find({
        _id: { $in: req.body.divisions }
      });
      
      if (divisions.length !== req.body.divisions.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more divisions not found'
        });
      }

      // Merge with existing divisions (avoid duplicates)
      const newDivisions = [...new Set([...user.divisions.map(div => div.toString()), ...req.body.divisions])];
      user.divisions = newDivisions;
    }

    await user.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'assignment_add',
      resourceType: 'user',
      resourceId: user._id,
      details: {
        targetUser: user.username,
        organizationalUnits: req.body.organizationalUnits || [],
        divisions: req.body.divisions || []
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const updatedUser = await User.findById(user._id)
      .populate('organizationalUnits', 'name code')
      .populate('divisions', 'name code');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Assign user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:userId/assignments
// @desc    Remove user from OU/division
// @access  Private (Admin only)
router.delete('/users/:userId/assignments', [
  body('organizationalUnits').optional().isArray(),
  body('divisions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove organizational units
    if (req.body.organizationalUnits) {
      user.organizationalUnits = user.organizationalUnits.filter(
        ou => !req.body.organizationalUnits.includes(ou.toString())
      );
    }

    // Remove divisions
    if (req.body.divisions) {
      user.divisions = user.divisions.filter(
        div => !req.body.divisions.includes(div.toString())
      );
    }

    await user.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'assignment_remove',
      resourceType: 'user',
      resourceId: user._id,
      details: {
        targetUser: user.username,
        organizationalUnits: req.body.organizationalUnits || [],
        divisions: req.body.divisions || []
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const updatedUser = await User.findById(user._id)
      .populate('organizationalUnits', 'name code')
      .populate('divisions', 'name code');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Remove assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/organizational-structure
// @desc    Get full OU/division hierarchy
// @access  Private (Admin only)
router.get('/organizational-structure', async (req, res) => {
  try {
    const ous = await OrganizationalUnit.find({ isActive: true })
      .populate('manager', 'username email')
      .populate({
        path: 'divisions',
        match: { isActive: true },
        populate: {
          path: 'lead',
          select: 'username email'
        }
      })
      .sort({ name: 1 });

    res.json({
      success: true,
      organizationalUnits: ous
    });
  } catch (error) {
    console.error('Get organizational structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

