const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 3600000 // 1 hour
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate reset token
passwordResetTokenSchema.statics.generateToken = function(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  return this.create({
    user: userId,
    token,
    expiresAt: Date.now() + 3600000 // 1 hour
  });
};

// Verify token
passwordResetTokenSchema.statics.verifyToken = async function(token) {
  const resetToken = await this.findOne({
    token,
    used: false,
    expiresAt: { $gt: Date.now() }
  }).populate('user');

  return resetToken;
};

// Clean up expired tokens
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

