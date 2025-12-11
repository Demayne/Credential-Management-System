# CoolTech Credential Management System

A production-grade MERN stack application for managing credentials across organizational units and divisions. Built with enterprise-level security, premium UI/UX, and comprehensive access control.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Demo Accounts](#demo-accounts)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
- **npm** (comes with Node.js) or **yarn**

### Verify Installation

```bash
node --version  # Should be v16 or higher
npm --version   # Should be v8 or higher
mongod --version  # If using local MongoDB
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Demayne/Credential-Management-System.git
cd Credential-Management-System
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (see Environment Setup section)
# Or run: npm run setup-env

# Seed the database with demo accounts and sample data
npm run seed

# Start the backend server (development mode)
npm run dev
```

The backend API will be running on `http://localhost:5000`

### 3. Frontend Setup

Open a **new terminal window** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be running on `http://localhost:3000`

### 4. Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Login with one of the demo accounts (see [Demo Accounts](#demo-accounts))
3. Start managing credentials!

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Connection
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/cooltech-dev
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cooltech-dev?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Encryption Key (must be exactly 32 characters for AES-256-CBC)
ENCRYPTION_KEY=your-32-character-encryption-key!
```

### Quick Setup Script

You can use the automated setup script:

```bash
cd backend
npm run setup-env
```

### MongoDB Atlas Setup (Cloud Database)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string from Atlas dashboard
4. Use the helper script to update your `.env` file:

```bash
cd backend
npm run update-atlas
```

Or manually update `MONGO_URI` in `backend/.env` with your Atlas connection string.

**Important**: Whitelist your IP address in Atlas Network Access settings.

## Project Structure

```
Credential-Management-System/
├── backend/
│   ├── config/              # Database configuration
│   ├── middleware/          # Auth, RBAC, activity logging
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route handlers
│   ├── scripts/             # Database seeding & utilities
│   ├── utils/               # Helper functions
│   └── server.js            # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React Context providers
│   │   ├── services/        # API service layer
│   │   ├── styles/          # SCSS stylesheets
│   │   └── utils/           # Utility functions
│   └── vite.config.js       # Vite configuration
│
└── README.md                # This file
```

## Demo Accounts

After running `npm run seed`, you can use these accounts:

### Admin Account
- **Email**: `admin@cooltech.com`
- **Password**: `Admin123!`
- **Role**: Admin (full access to all features)

### Management Account
- **Email**: `manager@cooltech.com`
- **Password**: `Manager123!`
- **Role**: Management (can read, add, and update credentials)

### Regular User Account
- **Email**: `user@cooltech.com`
- **Password**: `User123!`
- **Role**: User (can read and add credentials)

See `DEMO_ACCOUNTS.txt` for the complete list of demo accounts.

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT tokens)
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

### Credential Repository Endpoints

- `GET /api/repositories/accessible` - Get user's accessible repositories
- `GET /api/repositories/search` - Search credentials globally
- `GET /api/repositories/:divisionId` - Get division's repository
- `POST /api/repositories/:divisionId/credentials` - Add credential
- `PUT /api/repositories/credentials/:credentialId` - Update credential
- `DELETE /api/repositories/credentials/:credentialId` - Delete credential
- `GET /api/repositories/credentials/:credentialId/access` - View credential (decrypts password)

### Admin Endpoints

- `GET /api/admin/users` - Get all users (paginated, filtered)
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/role` - Change user role
- `POST /api/admin/users/:userId/assignments` - Assign user to OU/division
- `DELETE /api/admin/users/:userId/assignments` - Remove assignment
- `GET /api/admin/organizational-structure` - Get OU/division hierarchy
- `GET /api/admin/audit-logs` - Get system audit logs

### Utility Endpoints

- `POST /api/utils/generate-password` - Generate secure password
- `POST /api/utils/check-password-strength` - Check password strength

## User Roles & Permissions

### User (Default Role)
- ✅ View credential repositories (assigned divisions only)
- ✅ Add new credentials
- ✅ View credential details (with decrypted password)
- ❌ Update credentials
- ❌ Delete credentials
- ❌ Manage users or assignments

### Management
- ✅ All User permissions
- ✅ Update existing credentials
- ✅ Delete credentials
- ❌ Manage users or assignments

### Admin
- ✅ All Management permissions
- ✅ Assign/unassign users to Organizational Units and Divisions
- ✅ Change user roles
- ✅ View all repositories (all divisions)
- ✅ Access admin panel
- ✅ View system statistics and audit logs

## Security Features

- **JWT Authentication**: Secure token-based auth with refresh token rotation
- **Password Hashing**: bcrypt with 12 salt rounds
- **Credential Encryption**: AES-256-CBC encryption for stored passwords
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Automatic lockout after failed login attempts
- **Input Validation**: express-validator for request validation
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS**: Configured Cross-Origin Resource Sharing
- **Activity Logging**: Comprehensive audit trail
- **Role-Based Access Control**: Granular permission system

## Troubleshooting

### Common Issues

#### Backend won't start
- Check if MongoDB is running (local) or connection string is correct (Atlas)
- Verify all required environment variables are set in `backend/.env`
- Check if port 5000 is available

#### Frontend won't start
- Check if port 3000 is available
- Verify Node.js version is v16 or higher
- Delete `node_modules` and run `npm install` again

#### Login fails
- Run the troubleshooting script: `npm run troubleshoot-login` (in backend directory)
- Verify admin account exists: `npm run check-admin`
- Reset admin password: `npm run reset-admin-password`

#### MongoDB Connection Issues
- **Local MongoDB**: Ensure MongoDB service is running
- **MongoDB Atlas**: 
  - Verify connection string is correct
  - Whitelist your IP address in Atlas Network Access
  - Check if database name matches (`cooltech-dev`)

### Helper Scripts

```bash
# In backend directory:

# Troubleshoot login issues
npm run troubleshoot-login

# Check admin account status
npm run check-admin

# Reset admin password
npm run reset-admin-password

# Reset admin lock status
npm run reset-admin

# Update MongoDB Atlas connection string
npm run update-atlas
```

## Production Deployment

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

**Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

### Environment Variables for Production

Ensure all environment variables are set with production values:
- Use strong, unique secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Set `NODE_ENV=production`
- Use production MongoDB connection string
- Update `FRONTEND_URL` to your production domain
- Use a secure 32-character `ENCRYPTION_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Author

**Demayne**

- GitHub: [@Demayne](https://github.com/Demayne)

---

**Note**: This is a production-grade application. Ensure all environment variables are properly configured before deployment. For detailed setup instructions, see `SETUP_GUIDE.md`.
