/**
 * CredentialRepository Model
 * 
 * Defines the schema for credential repositories associated with divisions.
 * Each division has one credential repository containing encrypted credentials.
 * 
 * Security Features:
 * - AES-256-CBC encryption for credential passwords
 * - Automatic encryption before saving
 * - Decryption method for authorized access
 * - Access tracking (lastAccessed, accessCount)
 * - Expiration tracking for credentials
 * 
 * @module models/CredentialRepository
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-cbc'; // Advanced Encryption Standard with Cipher Block Chaining
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-long!';
const IV_LENGTH = 16; // Initialization Vector length for CBC mode

/**
 * Encryption Function
 * 
 * Encrypts plain text using AES-256-CBC encryption.
 * Generates a random IV for each encryption to ensure uniqueness.
 * Returns encrypted text in format: "iv:encryptedData" (both hex encoded)
 * 
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format "iv:encryptedData"
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decryption Function
 * 
 * Decrypts encrypted text using AES-256-CBC decryption.
 * Extracts IV from the encrypted string and uses it to decrypt the data.
 * 
 * @param {string} text - Encrypted text in format "iv:encryptedData"
 * @returns {string} - Decrypted plain text
 */
function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
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

/**
 * Pre-save Hook: Credential Password Encryption
 * 
 * Automatically encrypts credential passwords before saving to database.
 * Only encrypts if password has been modified and isn't already encrypted.
 * Uses AES-256-CBC encryption for maximum security.
 * 
 * @param {Function} next - Mongoose middleware next function
 */
credentialSchema.pre('save', function(next) {
  if (this.isModified('password') && !this.password.startsWith('encrypted:')) {
    this.password = 'encrypted:' + encrypt(this.password);
  }
  next();
});

/**
 * Instance Method: Get Decrypted Password
 * 
 * Decrypts and returns the credential password for authorized access.
 * This method should only be called after proper authorization checks.
 * Used when users need to view credential passwords.
 * 
 * @returns {string} - Decrypted password in plain text
 */
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

