const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
// Derive a stable 32-byte key from the env var using SHA-256 — works regardless of key length/format
const KEY_BUFFER = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || '').digest();

// Returns "iv:encryptedData" (both hex). Random IV per encryption ensures uniqueness.
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const credentialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  category: {
    type: String,
    enum: ['WordPress', 'Server', 'Database', 'Financial', 'API', 'Other'],
    default: 'Other'
  },
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastAccessed: Date,
  accessCount: {
    type: Number,
    default: 0
  },
  expiresAt: Date,
  expirationWarningSent: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

credentialSchema.pre('save', function(next) {
  if (this.isModified('password') && !this.password.startsWith('encrypted:')) {
    this.password = 'encrypted:' + encrypt(this.password);
  }
  next();
});

// Call only after authorization has been verified
credentialSchema.methods.getDecryptedPassword = function() {
  if (this.password.startsWith('encrypted:')) {
    return decrypt(this.password.replace('encrypted:', ''));
  }
  return this.password;
};

const credentialRepositorySchema = new mongoose.Schema({
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: [true, 'Division is required'],
    unique: true
  },
  credentials: [credentialSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('CredentialRepository', credentialRepositorySchema);

