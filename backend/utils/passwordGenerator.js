/**
 * Password Generator Utilities
 * 
 * Provides functions for generating secure random passwords and checking password strength.
 * Used by the password generator tool and password strength validation.
 * 
 * Features:
 * - Configurable password generation (length, character types)
 * - Password strength analysis
 * - Exclude similar characters option
 * - Ensures at least one character from each selected type
 * 
 * @module utils/passwordGenerator
 */

/**
 * Generate Secure Random Password
 * 
 * Generates a cryptographically secure random password with customizable options.
 * Ensures at least one character from each selected character type.
 * Shuffles the password to prevent predictable patterns.
 * 
 * @param {Object} options - Password generation options
 * @param {number} options.length - Password length (default: 16, range: 8-32)
 * @param {boolean} options.includeUppercase - Include uppercase letters A-Z (default: true)
 * @param {boolean} options.includeLowercase - Include lowercase letters a-z (default: true)
 * @param {boolean} options.includeNumbers - Include numbers 0-9 (default: true)
 * @param {boolean} options.includeSymbols - Include symbols !@#$%^&*()_+-=[]{}|;:,.<>? (default: true)
 * @param {boolean} options.excludeSimilar - Exclude similar characters (i, l, 1, L, o, 0, O) (default: false)
 * @returns {string} Generated secure password
 * @throws {Error} If no character types are selected
 */
function generatePassword(options = {}) {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = false
  } = options;

  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const uppercaseSimilar = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercaseSimilar = 'abcdefghijkmnopqrstuvwxyz';
  const numbersSimilar = '23456789';
  
  let charset = '';
  
  if (includeUppercase) {
    charset += excludeSimilar ? uppercaseSimilar : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (includeLowercase) {
    charset += excludeSimilar ? lowercaseSimilar : 'abcdefghijklmnopqrstuvwxyz';
  }
  if (includeNumbers) {
    charset += excludeSimilar ? numbersSimilar : '0123456789';
  }
  if (includeSymbols) {
    charset += symbols;
  }

  if (charset.length === 0) {
    throw new Error('At least one character type must be included');
  }

  // Ensure at least one character from each selected type
  let password = '';
  const types = [];
  
  if (includeUppercase) {
    const chars = excludeSimilar ? uppercaseSimilar : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    password += chars[Math.floor(Math.random() * chars.length)];
    types.push(chars);
  }
  if (includeLowercase) {
    const chars = excludeSimilar ? lowercaseSimilar : 'abcdefghijklmnopqrstuvwxyz';
    password += chars[Math.floor(Math.random() * chars.length)];
    types.push(chars);
  }
  if (includeNumbers) {
    const chars = excludeSimilar ? numbersSimilar : '0123456789';
    password += chars[Math.floor(Math.random() * chars.length)];
    types.push(chars);
  }
  if (includeSymbols) {
    password += symbols[Math.floor(Math.random() * symbols.length)];
    types.push(symbols);
  }

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check Password Strength
 * 
 * Analyzes password strength based on multiple criteria:
 * - Length (8+, 12+, 16+ characters)
 * - Character variety (lowercase, uppercase, numbers, symbols)
 * 
 * Returns strength score (0-6) and helpful feedback.
 * 
 * @param {string} password - Password to analyze
 * @returns {Object} Strength analysis object
 * @returns {number} strength - Strength score (0-6, where 6 is very strong)
 * @returns {string} strengthLabel - Human-readable strength label ('Very Weak' to 'Very Strong')
 * @returns {string[]} feedback - Array of improvement suggestions or confirmation message
 */
function checkPasswordStrength(password) {
  let strength = 0;
  const feedback = [];

  if (password.length >= 8) strength += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) strength += 1;
  if (password.length >= 16) strength += 1;

  if (/[a-z]/.test(password)) strength += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) strength += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) strength += 1;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
  else feedback.push('Add special characters');

  let strengthLabel = 'Very Weak';
  if (strength >= 6) strengthLabel = 'Very Strong';
  else if (strength >= 5) strengthLabel = 'Strong';
  else if (strength >= 4) strengthLabel = 'Medium';
  else if (strength >= 3) strengthLabel = 'Weak';

  return {
    strength,
    strengthLabel,
    feedback: feedback.length > 0 ? feedback : ['Strong password!']
  };
}

module.exports = {
  generatePassword,
  checkPasswordStrength
};

