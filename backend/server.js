/**
 * Express Server Configuration
 * 
 * Main server file that configures and starts the Express application.
 * Sets up middleware, routes, error handling, and security features.
 * 
 * Security Features:
 * - Helmet.js for security headers
 * - CORS configuration
 * - Rate limiting (stricter for auth endpoints)
 * - Environment variable validation
 * 
 * Middleware:
 * - Body parsing (JSON, URL-encoded)
 * - Request logging
 * - Error handling
 * 
 * Routes:
 * - /api/auth - Authentication endpoints
 * - /api/repositories - Credential repository endpoints
 * - /api/admin - Admin operation endpoints
 * - /api/utils - Utility endpoints
 * - /api/statistics - Statistics endpoints
 * 
 * @module server
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

/**
 * Load Environment Variables
 * 
 * Loads environment variables from .env file.
 * Validates required variables before starting server.
 */
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');

if (missingVars.length > 0) {
  console.error('❌ Missing or empty required environment variables:', missingVars.join(', '));
  console.error('Please create a .env file in the backend directory with the required variables.');
  console.error('Run: npm run setup-env');
  console.error('Or create .env manually with:');
  console.error('JWT_SECRET=your-secret-key');
  console.error('JWT_REFRESH_SECRET=your-refresh-secret-key');
  console.error('MONGO_URI=mongodb://localhost:27017/cooltech-dev');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - More lenient in development
const isDevelopment = process.env.NODE_ENV === 'development';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Higher limit in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiting - More lenient in development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // Much higher limit in development (50 vs 5)
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

app.use('/api/auth', authLimiter);

app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/repositories', require('./routes/repositories'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/utils', require('./routes/utils'));
app.use('/api/statistics', require('./routes/statistics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

