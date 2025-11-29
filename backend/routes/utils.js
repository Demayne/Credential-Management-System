const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generatePassword, checkPasswordStrength } = require('../utils/passwordGenerator');

// @route   POST /api/utils/generate-password
// @desc    Generate a secure password
// @access  Private
router.post('/generate-password', protect, (req, res) => {
  try {
    const options = {
      length: parseInt(req.body.length) || 16,
      includeUppercase: req.body.includeUppercase !== false,
      includeLowercase: req.body.includeLowercase !== false,
      includeNumbers: req.body.includeNumbers !== false,
      includeSymbols: req.body.includeSymbols !== false,
      excludeSimilar: req.body.excludeSimilar === true
    };

    const password = generatePassword(options);
    const strength = checkPasswordStrength(password);

    res.json({
      success: true,
      password,
      strength
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/utils/check-password-strength
// @desc    Check password strength
// @access  Private
router.post('/check-password-strength', protect, (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const strength = checkPasswordStrength(password);

    res.json({
      success: true,
      strength
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

