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

  let charset = '';

  if (includeUppercase) {
    charset += excludeSimilar ? uppercase : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (includeLowercase) {
    charset += excludeSimilar ? lowercase : 'abcdefghijklmnopqrstuvwxyz';
  }
  if (includeNumbers) {
    charset += excludeSimilar ? numbers : '0123456789';
  }
  if (includeSymbols) {
    charset += symbols;
  }

  if (charset.length === 0) {
    throw new Error('At least one character type must be included');
  }

  // Ensure at least one character from each selected type
  let password = '';

  if (includeUppercase) {
    const chars = excludeSimilar ? uppercase : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  if (includeLowercase) {
    const chars = excludeSimilar ? lowercase : 'abcdefghijklmnopqrstuvwxyz';
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  if (includeNumbers) {
    const chars = excludeSimilar ? numbers : '0123456789';
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  if (includeSymbols) {
    password += symbols[Math.floor(Math.random() * symbols.length)];
  }

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

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
