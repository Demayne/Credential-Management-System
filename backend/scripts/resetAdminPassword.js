require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const resetAdminPassword = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database.\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@cooltech.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin user...');
      // This shouldn't happen if seed script ran, but handle it anyway
      await mongoose.connection.close();
      console.log('Please run seed script first: npm run seed');
      process.exit(1);
    }

    console.log('📋 Current Admin Account Status:');
    console.log('  Email:', admin.email);
    console.log('  Username:', admin.username);
    console.log('  Role:', admin.role);
    console.log('  Is Active:', admin.isActive);
    console.log('  Login Attempts:', admin.loginAttempts);
    console.log('  Account Locked:', admin.isLocked());

    // Reset password to Admin123!
    console.log('\n🔐 Resetting password to: Admin123!');
    admin.password = 'Admin123!';
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    console.log('\n✅ Admin password reset successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('  Email: admin@cooltech.com');
    console.log('  Password: Admin123!');
    console.log('\n💡 If login still fails, check:');
    console.log('  1. Email is exactly: admin@cooltech.com (lowercase)');
    console.log('  2. Password is exactly: Admin123! (case-sensitive)');
    console.log('  3. Backend server is running');
    console.log('  4. Frontend is connecting to correct backend URL');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

resetAdminPassword();

