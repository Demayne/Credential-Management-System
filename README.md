# CoolTech Credential Management System

A production-grade MERN stack application for managing credentials across organizational units and divisions. Built with enterprise-level security and a premium UI/UX.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [User Roles & Permissions](#user-roles--permissions)
- [Documentation](#documentation)
- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **Secure Authentication**: JWT-based authentication with refresh token rotation
- **Role-Based Access Control**: Three user roles (user, management, admin) with granular permissions
- **Credential Management**: AES-256-CBC encrypted credential storage and management
- **Organizational Structure**: Support for multiple Organizational Units (OUs) with 12+ divisions each
- **Repository System**: Division-based credential repositories with access control
- **Admin Panel**: Comprehensive user management and assignment tools
- **Modern UI**: Dark theme with SCSS, responsive design, premium UX

### Enterprise Features
- **Password Reset**: Forgot password and reset functionality
- **Password Strength Indicator**: Real-time password strength validation
- **Password Generator**: Secure password generation tool
- **Activity Logging**: Comprehensive audit trail for all user actions
- **Credential Expiration**: Track and alert on credential expiration
- **Global Search**: Search credentials across all accessible repositories
- **System Statistics**: Dashboard statistics for admins
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Automatic account lockout after failed login attempts

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs (12 salt rounds)
- **Encryption**: Node.js crypto (AES-256-CBC)
- **Validation**: express-validator
- **Security**: Helmet.js, CORS, express-rate-limit

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: SCSS (Sass) with modular architecture
- **Build Tool**: Vite
- **State Management**: React Context API

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (see SETUP_GUIDE.md for details)
# Or run: npm run setup-env

# Seed the database with demo accounts and sample data
npm run seed

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/cooltech-dev
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
ENCRYPTION_KEY=your-32-character-encryption-key!
```

See `SETUP_GUIDE.md` for detailed setup instructions.

## 👥 Demo Accounts

The seed script creates three demo accounts for testing:

### Admin User
- **Email**: `admin@cooltech.com`
- **Password**: `Admin123!`
- **Role**: Admin (full access to all features)

### Management User
- **Email**: `manager@cooltech.com`
- **Password**: `Manager123!`
- **Role**: Management (can read, add, and update credentials)

### Regular User
- **Email**: `user@cooltech.com`
- **Password**: `User123!`
- **Role**: User (can read and add credentials)

See `DEMO_ACCOUNTS.txt` for complete list of demo accounts.

## 📁 Project Structure

```
.
├── backend/
│   ├── config/              # Database configuration
│   ├── middleware/          # Auth, RBAC, activity logging middleware
│   ├── models/              # Mongoose schemas (User, CredentialRepository, etc.)
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── repositories.js  # Credential repository endpoints
│   │   ├── admin.js         # Admin operation endpoints
│   │   ├── utils.js         # Utility endpoints (password generator, etc.)
│   │   └── statistics.js    # Statistics endpoints
│   ├── scripts/             # Database seeding and utility scripts
│   ├── utils/               # Utility functions (token generation, password generator)
│   ├── server.js            # Express server entry point
│   └── resources.txt       # Backend technology resources and documentation
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── admin/       # Admin panel components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── common/      # Shared components (Toast, LoadingSpinner, etc.)
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   ├── layout/      # Layout components (Sidebar, TopBar)
│   │   │   └── repositories/# Repository view components
│   │   ├── contexts/        # React Context providers
│   │   ├── services/        # API service layer
│   │   ├── styles/          # SCSS stylesheets (modular architecture)
│   │   └── utils/           # Utility functions
│   ├── vite.config.js       # Vite configuration
│   └── resources.txt        # Frontend technology resources and documentation
│
└── Documentation files (see Documentation section)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (default role: 'user')
- `POST /api/auth/login` - Login user (returns JWT + refresh token)
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated users)

### Credential Repositories
- `GET /api/repositories/accessible` - Get user's accessible repositories
- `GET /api/repositories/search` - Search credentials across accessible repositories
- `GET /api/repositories/:divisionId` - Get division's credential repository
- `POST /api/repositories/:divisionId/credentials` - Add new credential
- `PUT /api/repositories/credentials/:credentialId` - Update credential
- `DELETE /api/repositories/credentials/:credentialId` - Soft delete credential
- `GET /api/repositories/credentials/:credentialId/access` - View credential (decrypts password)

### Admin Operations
- `GET /api/admin/users` - Get all users (paginated, filtered)
- `GET /api/admin/users/:userId` - Get specific user details
- `PUT /api/admin/users/:userId/role` - Change user role
- `POST /api/admin/users/:userId/assignments` - Assign user to OU/division
- `DELETE /api/admin/users/:userId/assignments` - Remove user from OU/division
- `GET /api/admin/organizational-structure` - Get full OU/division hierarchy
- `GET /api/admin/audit-logs` - Get system audit logs

### Utilities
- `POST /api/utils/generate-password` - Generate secure password
- `POST /api/utils/check-password-strength` - Check password strength

### Statistics
- `GET /api/statistics/dashboard` - Get dashboard statistics (admin only)
- `GET /api/statistics/activity-logs` - Get activity logs

## 🔐 User Roles & Permissions

### Normal User
- ✅ View credential repositories (assigned divisions only)
- ✅ Add new credentials
- ✅ View credential details (with decrypted password)
- ❌ Update credentials
- ❌ Delete credentials
- ❌ Manage users or assignments

### Management User
- ✅ All Normal User permissions
- ✅ Update existing credentials
- ✅ Delete credentials
- ❌ Manage users or assignments

### Admin User
- ✅ All Management User permissions
- ✅ Assign/unassign users to Organizational Units and Divisions
- ✅ Change user roles
- ✅ View all repositories (all divisions)
- ✅ Access admin panel
- ✅ View system statistics and audit logs

## 📚 Documentation

### Setup & Configuration
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[GITHUB_PUSH_GUIDE.md](./GITHUB_PUSH_GUIDE.md)** - Guide for pushing to GitHub
- **[DEMO_ACCOUNTS.txt](./DEMO_ACCOUNTS.txt)** - Complete list of demo accounts

### Project Documentation
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview and architecture
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[ENTERPRISE_FEATURES.md](./ENTERPRISE_FEATURES.md)** - Enterprise features documentation
- **[ENHANCEMENTS_SUMMARY.md](./ENHANCEMENTS_SUMMARY.md)** - Enhancements overview

### Compliance & Requirements
- **[TASK_COMPLIANCE_REPORT.md](./TASK_COMPLIANCE_REPORT.md)** - Task requirements compliance
- **[REQUIREMENTS_CHECKLIST.md](./REQUIREMENTS_CHECKLIST.md)** - Requirements checklist
- **[SPECIFICATIONS_COMPLIANCE.md](./SPECIFICATIONS_COMPLIANCE.md)** - Specifications compliance

### Troubleshooting
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[RATE_LIMIT_FIX.md](./RATE_LIMIT_FIX.md)** - Rate limiting configuration
- **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Applied fixes documentation

### Task Requirements
- **[Task_overview.txt](./Task_overview.txt)** - Original task overview
- **[Task_prompt2.txt](./Task_prompt2.txt)** - Detailed task specifications

## 📖 Resources

### Technology Resources
- **[backend/resources.txt](./backend/resources.txt)** - Backend technology resources, documentation URLs, and research references
- **[frontend/resources.txt](./frontend/resources.txt)** - Frontend technology resources, documentation URLs, and research references

These files contain comprehensive lists of:
- Official documentation URLs
- Tutorials and guides
- Best practices
- Security resources
- API references
- Learning resources

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with refresh token rotation
- **Password Hashing**: bcrypt with 12 salt rounds
- **Credential Encryption**: AES-256-CBC encryption for stored passwords
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Automatic lockout after failed login attempts
- **Input Validation**: express-validator for request validation
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS**: Configured Cross-Origin Resource Sharing
- **Activity Logging**: Comprehensive audit trail
- **Role-Based Access Control**: Granular permission system

## 🧪 Testing

### Backend Scripts
```bash
# Reset admin password
npm run reset-admin-password

# Check admin account status
npm run check-admin

# Reset admin lock status
npm run reset-admin
```

## 📝 Code Documentation

The codebase includes comprehensive JSDoc-style comments:
- **Models**: Schema definitions with field descriptions
- **Middleware**: Authentication and authorization logic
- **Routes**: API endpoint documentation
- **Components**: React component descriptions
- **Utilities**: Function documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 👤 Author

**Demayne**

- GitHub: [@Demayne](https://github.com/Demayne)

## 🙏 Acknowledgments

- Design inspiration from N-Able/CertifyMe professional interfaces
- Built following MERN stack best practices
- Security guidelines from OWASP

---

**Note**: This is a production-grade application built for CoolTech's credential management needs. Ensure all environment variables are properly configured before deployment.
