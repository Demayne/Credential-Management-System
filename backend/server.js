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
const { monitorMiddleware, getStats } = require('./middleware/monitor');

/**
 * Load Environment Variables
 * 
 * Loads environment variables from .env file.
 * Validates required variables before starting server.
 */
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI', 'ENCRYPTION_KEY'];
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

if (process.env.ENCRYPTION_KEY.length < 32) {
  console.error('❌ ENCRYPTION_KEY must be at least 32 characters long for AES-256 encryption.');
  console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
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

// Request monitoring — must be before routes
app.use(monitorMiddleware);

// Body parser — 10kb limit prevents large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/repositories', require('./routes/repositories'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/utils', require('./routes/utils'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/metrics', require('./routes/metrics'));

// Health check — covers all 6 deployment monitoring checks
app.get('/api/health', async (_req, res) => {
  const mongoose = require('mongoose');
  const dbStateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';

  // DB ping latency
  let dbPingMs = null;
  try {
    const t = Date.now();
    await mongoose.connection.db.admin().ping();
    dbPingMs = Date.now() - t;
  } catch { /* db unreachable */ }

  // Server resource usage
  const mem = process.memoryUsage();
  const requestStats = getStats();

  res.json({
    success: true,
    status: dbState === 'connected' ? 'healthy' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: requestStats.uptime,
    database: {
      state: dbState,
      healthy: dbState === 'connected',
      pingMs: dbPingMs,
      pingWithinTarget: dbPingMs !== null && dbPingMs < 100,
    },
    latency: requestStats.requests.latency ?? requestStats.latency,
    errorRates: {
      '4xx': requestStats.requests?.errorRate4xx ?? 0,
      '5xx': requestStats.requests?.errorRate5xx ?? 0,
      percent: requestStats.requests?.errorRatePercent ?? 0,
    },
    throughput: requestStats.throughput,
    server: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
  });
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

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled errors — prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

