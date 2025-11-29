/**
 * Password Strength Utility (Frontend)
 * 
 * Client-side password strength checking utility.
 * Provides real-time feedback for password input fields.
 * 
 * Analyzes password based on:
 * - Length requirements (8+, 12+, 16+)
 * - Character variety (lowercase, uppercase, numbers, symbols)
 * 
 * Returns strength score and helpful feedback messages.
 * 
 * @param {string} password - Password to analyze
 * @returns {Object} Strength analysis
 * @returns {number} strength - Strength score (0-6)
 * @returns {string} strengthLabel - Strength label ('Very Weak' to 'Very Strong')
 * @returns {string[]} feedback - Improvement suggestions or confirmation
 */
export function checkPasswordStrength(password) {
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

