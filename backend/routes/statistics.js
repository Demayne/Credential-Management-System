const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const CredentialRepository = require('../models/CredentialRepository');
const Division = require('../models/Division');
const OrganizationalUnit = require('../models/OrganizationalUnit');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/statistics/dashboard
// @desc    Get dashboard statistics (admin only)
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCredentials,
      activeCredentials,
      totalDivisions,
      totalOUs,
      recentActivity,
      credentialsByCategory,
      usersByRole
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      CredentialRepository.aggregate([
        { $unwind: '$credentials' },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0),
      CredentialRepository.aggregate([
        { $unwind: '$credentials' },
        { $match: { 'credentials.isActive': { $ne: false } } },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0),
      Division.countDocuments({ isActive: true }),
      OrganizationalUnit.countDocuments({ isActive: true }),
      ActivityLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('user', 'username email')
        .lean(),
      CredentialRepository.aggregate([
        { $unwind: '$credentials' },
        { $match: { 'credentials.isActive': { $ne: false } } },
        { $group: { _id: '$credentials.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Get expiring credentials (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringCredentials = await CredentialRepository.aggregate([
      { $unwind: '$credentials' },
      {
        $match: {
          'credentials.isActive': { $ne: false },
          'credentials.expiresAt': {
            $exists: true,
            $lte: thirtyDaysFromNow,
            $gte: new Date()
          }
        }
      },
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    res.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          byRole: usersByRole
        },
        credentials: {
          total: totalCredentials,
          active: activeCredentials,
          inactive: totalCredentials - activeCredentials,
          expiring: expiringCredentials,
          byCategory: credentialsByCategory
        },
        structure: {
          organizationalUnits: totalOUs,
          divisions: totalDivisions
        },
        recentActivity: recentActivity
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/statistics/activity
// @desc    Get activity logs
// @access  Private (Admin)
router.get('/activity', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.userId) {
      filter.user = req.query.userId;
    }
    if (req.query.action) {
      filter.action = req.query.action;
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .populate('user', 'username email role')
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

