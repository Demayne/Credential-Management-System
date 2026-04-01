const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30m'
  });
};

const generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

module.exports = { generateToken, generateRefreshToken };
