/**
 * JWT Token Generation Utilities
 * 
 * Provides functions for generating JWT access tokens and refresh tokens.
 * Uses separate secrets for access and refresh tokens for enhanced security.
 * 
 * Token Expiration:
 * - Access Token: 30 minutes (configurable via JWT_EXPIRE)
 * - Refresh Token: 7 days (configurable via JWT_REFRESH_EXPIRE)
 * 
 * @module utils/generateToken
 */

const jwt = require('jsonwebtoken');

/**
 * Generate Access Token
 * 
 * Creates a JWT access token containing the user ID.
 * Access tokens are short-lived (30 minutes) and used for API authentication.
 * 
 * @param {string} id - MongoDB user ID (_id)
 * @returns {string} - JWT access token
 * @throws {Error} - If JWT_SECRET is not defined in environment variables
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30m'
  });
};

/**
 * Generate Refresh Token
 * 
 * Creates a JWT refresh token containing the user ID.
 * Refresh tokens are long-lived (7 days) and used to obtain new access tokens.
 * Uses a separate secret from access tokens for security.
 * 
 * @param {string} id - MongoDB user ID (_id)
 * @returns {string} - JWT refresh token
 * @throws {Error} - If JWT_REFRESH_SECRET is not defined in environment variables
 */
const generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

module.exports = { generateToken, generateRefreshToken };

