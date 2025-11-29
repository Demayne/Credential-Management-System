# Setup Guide - CoolTech Credential Management System

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example or use the values below)
# NODE_ENV=development
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/cooltech-dev
# JWT_SECRET=dev-secret-change-in-production
# JWT_REFRESH_SECRET=dev-refresh-secret-change
# JWT_EXPIRE=30m
# JWT_REFRESH_EXPIRE=7d
# FRONTEND_URL=http://localhost:3000
# ENCRYPTION_KEY=dev-encryption-key-32-chars-long!

# Seed the database with demo accounts
npm run seed

# Start the backend server
npm run dev
```

The backend will be running on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running on `http://localhost:3000`

## Demo Accounts

After running the seed script, you can use these accounts:

### Admin Account
- **Email**: admin@cooltech.com
- **Password**: Admin123!
- **Role**: Admin (full access)

### Management Account
- **Email**: manager@cooltech.com
- **Password**: Manager123!
- **Role**: Management (can read, add, and update credentials)

### Regular User Account
- **Email**: user@cooltech.com
- **Password**: User123!
- **Role**: User (can read and add credentials)

## Testing the Application

1. **Login as Admin**:
   - Access admin panel
   - Manage users and roles
   - Assign users to organizational units and divisions

2. **Login as Manager**:
   - View repositories
   - Add new credentials
   - Edit existing credentials

3. **Login as User**:
   - View repositories
   - Add new credentials
   - Cannot edit or delete credentials

## Features to Test

- ✅ User registration and login
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ View credential repositories
- ✅ Add credentials (all users)
- ✅ Edit credentials (management and admin)
- ✅ Delete credentials (management and admin)
- ✅ Admin user management
- ✅ Admin role changes
- ✅ Admin user assignments to OUs and divisions
- ✅ Password encryption and decryption
- ✅ Responsive dark theme UI

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check your MongoDB service
- Verify connection string in `.env` file
- Check MongoDB logs for errors

### Port Already in Use
- Backend: Change `PORT` in `.env` file
- Frontend: Modify `vite.config.js` server port

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser console for CORS errors

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in backend `.env`
- Verify token expiration settings

## Project Structure

```
Task 35 - Authentication 2/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Seed script
│   ├── server.js        # Express app
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── styles/      # SCSS files
│   └── package.json
│
├── README.md
├── SETUP_GUIDE.md
└── DEMO_ACCOUNTS.txt
```

## Next Steps

1. Test all user roles and permissions
2. Add more credentials through the UI
3. Test admin panel features
4. Explore the organizational structure
5. Test credential encryption/decryption

## Support

If you encounter any issues:
1. Check the console logs (both backend and frontend)
2. Verify MongoDB is running
3. Ensure all environment variables are set correctly
4. Check that all dependencies are installed

