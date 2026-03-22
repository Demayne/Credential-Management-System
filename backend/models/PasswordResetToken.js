const mongoose = require('mongoose');
const crypto = require('crypto');

// Hash a raw token before storing — the email link carries the raw token,
// the DB only ever holds the hash so a DB leak can't be replayed.
function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

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
// Returns { rawToken, doc } — rawToken goes in the email link, doc is the DB record.
// The DB stores only the SHA-256 hash of the raw token.
passwordResetTokenSchema.statics.generateToken = async function(userId) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const doc = await this.create({
    user: userId,
    token: hashToken(rawToken),
    expiresAt: Date.now() + 3600000 // 1 hour
  });
  return { rawToken, doc };
};

// Verify token — accepts the raw token from the email link, hashes it to look up in DB.
passwordResetTokenSchema.statics.verifyToken = async function(rawToken) {
  const resetToken = await this.findOne({
    token: hashToken(rawToken),
    used: false,
    expiresAt: { $gt: Date.now() }
  }).populate('user');

  return resetToken;
};

// Clean up expired tokens
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

