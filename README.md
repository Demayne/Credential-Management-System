# Credential Management System

A centralized credential management platform for organizations to store, manage, and control access to system credentials across multiple organizational units and divisions.

## Overview

This application provides a secure repository system where organizations can store credentials (usernames, passwords, API keys) for various systems and services. Credentials are organized by organizational units and divisions, with granular access control based on user roles. All stored passwords are encrypted at rest using AES-256-CBC encryption.

### What It Does

- **Credential Storage**: Securely stores credentials for systems, applications, and services
- **Access Control**: Restricts credential access based on organizational structure and user roles
- **Credential Management**: Supports adding, viewing, updating, and deleting credentials with role-based permissions
- **Audit Trail**: Logs all credential access and modifications for security auditing
- **User Management**: Administrators can assign users to specific organizational units and divisions
- **Search**: Global search functionality across all accessible credential repositories

### Who Uses It

- **IT Administrators**: Manage system credentials, assign user access, and monitor credential usage across the organization
- **Department Managers**: Oversee credentials within their organizational units and divisions
- **Team Members**: Access credentials for systems they need to work with, based on their assigned divisions
- **Security Teams**: Review audit logs and monitor credential access patterns
- **System Administrators**: Maintain credential repositories and ensure proper access controls

## Prerequisites

- **Node.js** v16 or higher - [Download](https://nodejs.org/)
- **MongoDB** v5.0 or higher - [Download](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** v8 or higher (included with Node.js)

### Verify Installation

```bash
node --version  # v16+
npm --version    # v8+
mongod --version # If using local MongoDB
```

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Demayne/Credential-Management-System.git
cd Credential-Management-System
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run setup-env  # Creates .env file with default values
npm run seed       # Seeds database with demo accounts and sample data
npm run dev        # Starts development server on http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev        # Starts development server on http://localhost:3000
```

### 4. Access Application

Navigate to `http://localhost:3000` and login with demo credentials (see [Demo Accounts](#demo-accounts)).

## Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/cooltech-dev
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cooltech-dev?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d

# Application
FRONTEND_URL=http://localhost:3000
ENCRYPTION_KEY=your-32-character-encryption-key!
```

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster and get connection string
3. Run helper script: `npm run update-atlas` (in backend directory)
4. Whitelist your IP address in Atlas Network Access settings

## Project Structure

```
Credential-Management-System/
├── backend/
│   ├── config/              # Database configuration
│   ├── middleware/          # Authentication, authorization, logging
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── scripts/             # Database seeding and utilities
│   ├── utils/               # Helper functions
│   └── server.js            # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React Context providers
│   │   ├── services/        # API client
│   │   ├── styles/          # SCSS stylesheets
│   │   └── utils/           # Utility functions
│   └── vite.config.js       # Vite configuration
│
└── README.md
```

## Demo Accounts

After running `npm run seed`, use these accounts:

| Role | Email | Password | Capabilities |
|------|-------|----------|--------------|
| Admin | `admin@cooltech.com` | `Admin123!` | Full system access, user management, all repositories |
| Management | `manager@cooltech.com` | `Manager123!` | Read, add, update, delete credentials |
| User | `user@cooltech.com` | `User123!` | Read and add credentials |

See `DEMO_ACCOUNTS.txt` for complete list.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate and receive JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

### Credential Repositories

- `GET /api/repositories/accessible` - List user's accessible repositories
- `GET /api/repositories/search` - Search credentials globally
- `GET /api/repositories/:divisionId` - Get division repository
- `POST /api/repositories/:divisionId/credentials` - Add credential
- `PUT /api/repositories/credentials/:credentialId` - Update credential
- `DELETE /api/repositories/credentials/:credentialId` - Delete credential
- `GET /api/repositories/credentials/:credentialId/access` - View credential (decrypts password)

### Administration

- `GET /api/admin/users` - List all users (paginated, filtered)
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/role` - Change user role
- `POST /api/admin/users/:userId/assignments` - Assign user to OU/division
- `DELETE /api/admin/users/:userId/assignments` - Remove assignment
- `GET /api/admin/organizational-structure` - Get OU/division hierarchy
- `GET /api/admin/audit-logs` - Get system audit logs

### Utilities

- `POST /api/utils/generate-password` - Generate secure password
- `POST /api/utils/check-password-strength` - Validate password strength

## User Roles & Permissions

### User (Default)

- View credential repositories (assigned divisions only)
- Add new credentials
- View credential details with decrypted passwords
- Cannot modify or delete existing credentials
- Cannot manage users or access assignments

### Management

- All User permissions
- Update existing credentials
- Delete credentials
- Cannot manage users or organizational assignments

### Admin

- All Management permissions
- Assign/unassign users to organizational units and divisions
- Modify user roles
- Access all repositories across all divisions
- View system statistics and audit logs
- Manage organizational structure

## Security Implementation

- **Authentication**: JWT tokens with refresh token rotation
- **Password Storage**: bcrypt hashing (12 salt rounds)
- **Credential Encryption**: AES-256-CBC encryption for stored passwords
- **Access Control**: Role-based permissions with organizational unit restrictions
- **Rate Limiting**: Brute force protection on authentication endpoints
- **Account Lockout**: Automatic lockout after failed login attempts
- **Input Validation**: Request validation using express-validator
- **Security Headers**: Helmet.js for HTTP security headers
- **Audit Logging**: Comprehensive activity logging for all credential access

## Troubleshooting

### Backend Issues

**Server won't start:**
- Verify MongoDB is running (local) or connection string is correct (Atlas)
- Check all required environment variables are set in `backend/.env`
- Ensure port 5000 is available

**Login failures:**
```bash
cd backend
npm run troubleshoot-login  # Diagnose login issues
npm run check-admin         # Verify admin account exists
npm run reset-admin-password # Reset admin password
```

### Frontend Issues

**Application won't start:**
- Verify Node.js version is v16 or higher
- Check port 3000 is available
- Delete `node_modules` and run `npm install` again

### Database Connection

**Local MongoDB:**
- Ensure MongoDB service is running
- Verify connection string: `mongodb://localhost:27017/cooltech-dev`

**MongoDB Atlas:**
- Verify connection string format
- Whitelist your IP address in Atlas Network Access
- Confirm database name matches (`cooltech-dev`)

### Helper Scripts

```bash
# In backend directory:
npm run troubleshoot-login  # Diagnose authentication issues
npm run check-admin         # Check admin account status
npm run reset-admin-password # Reset admin password
npm run reset-admin         # Reset admin lock status
npm run update-atlas        # Update MongoDB Atlas connection string
```

## Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

Production build output: `frontend/dist/`

### Run Backend

```bash
cd backend
NODE_ENV=production npm start
```

### Production Environment Variables

- Set `NODE_ENV=production`
- Use strong, unique secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET` (minimum 32 characters)
- Use production MongoDB connection string
- Update `FRONTEND_URL` to production domain
- Use secure 32-character `ENCRYPTION_KEY`

## Technology Stack

**Backend:**
- Node.js, Express.js
- MongoDB, Mongoose
- JWT authentication
- bcryptjs password hashing
- AES-256-CBC encryption

**Frontend:**
- React 18
- React Router v6
- Axios
- SCSS
- Vite

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/feature-name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/feature-name`)
5. Open Pull Request

## License

ISC

## Author

**Demayne**

- GitHub: [@Demayne](https://github.com/Demayne)

---

For detailed setup instructions, see `SETUP_GUIDE.md`.
