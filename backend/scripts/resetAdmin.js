require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const resetAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database.');

    // Find admin user
    console.log('Looking for admin user...');
    const admin = await User.findOne({ email: 'admin@cooltech.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found. Please run seed script first: npm run seed');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('Found admin user:', admin.email);
    console.log('Current login attempts:', admin.loginAttempts);
    console.log('Account locked:', admin.isLocked());

    // Reset login attempts and unlock account
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    console.log('\n✅ Admin account reset successfully!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Login attempts:', admin.loginAttempts);
    console.log('Account locked:', admin.isLocked());
    console.log('\nYou can now login with:');
    console.log('  Email: admin@cooltech.com');
    console.log('  Password: Admin123!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

resetAdmin();

