/**
 * Authentication Routes
 * 
 * Handles all authentication-related endpoints including:
 * - User registration
 * - User login with JWT token generation
 * - Password reset (forgot/reset)
 * - Password change for authenticated users
 * - Current user profile retrieval
 * 
 * Security Features:
 * - Input validation using express-validator
 * - Password hashing via User model pre-save hook
 * - Account lockout after failed login attempts
 * - Activity logging for security auditing
 * - Email enumeration prevention
 * 
 * @module routes/auth
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const ActivityLog = require('../models/ActivityLog');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 * 
 * Creates a new user account with default 'user' role.
 * Validates username (3-30 chars), email format, and password (min 8 chars).
 * Normalizes email to lowercase and trims whitespace.
 * Returns JWT access token and refresh token upon successful registration.
 * 
 * Request Body:
 * - username: string (required, 3-30 characters)
 * - email: string (required, valid email format)
 * - password: string (required, minimum 8 characters)
 * 
 * Response:
 * - success: boolean
 * - token: JWT access token (30 min expiry)
 * - refreshToken: JWT refresh token (7 day expiry)
 * - user: { id, username, email, role }
 */
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create user (default role is 'user')
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();

    // Find user and include password for comparison
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }
      
      await user.save();

      // Enhanced error logging for debugging
      console.error('Login failed:', {
        email: normalizedEmail,
        loginAttempts: user.loginAttempts,
        isLocked: user.isLocked(),
        lockUntil: user.lockUntil
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            loginAttempts: user.loginAttempts,
            isLocked: user.isLocked()
          }
        })
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationalUnits: user.organizationalUnits,
        divisions: user.divisions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organizationalUnits', 'name code')
      .populate('divisions', 'name code organizationalUnit');

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

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = await PasswordResetToken.generateToken(user._id);

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'password_change',
      resourceType: 'user',
      resourceId: user._id,
      details: { type: 'reset_requested' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // In production, send email here
    // For now, return token in development
    const resetUrl = process.env.NODE_ENV === 'development' 
      ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken.token}`
      : null;

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && { resetUrl, token: resetToken.token })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    const resetToken = await PasswordResetToken.verifyToken(token);

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const user = await User.findById(resetToken.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = password;
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'password_change',
      resourceType: 'user',
      resourceId: user._id,
      details: { type: 'reset_completed' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password (authenticated user)
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'password_change',
      resourceType: 'user',
      resourceId: user._id,
      details: { type: 'changed' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

