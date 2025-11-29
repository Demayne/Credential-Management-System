/**
 * User Model
 * 
 * Defines the User schema for MongoDB using Mongoose.
 * This model represents users in the CoolTech credential management system.
 * 
 * Key Features:
 * - Password hashing with bcrypt (12 salt rounds for security)
 * - Account lockout mechanism after failed login attempts
 * - Role-based access control (user, management, admin)
 * - Multi-OU and multi-division assignment support
 * - Login attempt tracking and account security
 * 
 * @module models/User
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * 
 * Stores user authentication and profile information.
 * Passwords are automatically hashed before saving (see pre-save hook).
 * Password field is excluded from queries by default (select: false) for security.
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'management', 'admin'],
    default: 'user'
  },
  organizationalUnits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationalUnit'
  }],
  divisions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division'
  }],
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    department: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

/**
 * Pre-save Hook: Password Hashing
 * 
 * Automatically hashes passwords before saving to the database.
 * Uses bcrypt with 12 salt rounds for strong security.
 * Only hashes if password field has been modified.
 * 
 * @param {Function} next - Mongoose middleware next function
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance Method: Compare Password
 * 
 * Compares a candidate password with the stored hashed password.
 * Used during login to verify user credentials.
 * 
 * @param {string} candidatePassword - The password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance Method: Check Account Lock Status
 * 
 * Determines if the user account is currently locked due to failed login attempts.
 * Account locks expire after the lockUntil timestamp.
 * 
 * @returns {boolean} - True if account is locked, false otherwise
 */
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', userSchema);

