require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');
const bcrypt = require('bcryptjs');

const checkAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database.\n');

    // Find admin user with password
    const admin = await User.findOne({ email: 'admin@cooltech.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found. Please run seed script first: npm run seed');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('📋 Admin Account Details:');
    console.log('  Email:', admin.email);
    console.log('  Username:', admin.username);
    console.log('  Role:', admin.role);
    console.log('  Is Active:', admin.isActive);
    console.log('  Login Attempts:', admin.loginAttempts);
    console.log('  Lock Until:', admin.lockUntil);
    console.log('  Account Locked:', admin.isLocked());
    console.log('  Password Hash:', admin.password ? admin.password.substring(0, 20) + '...' : 'NOT SET');

    // Test password
    const testPassword = 'Admin123!';
    console.log('\n🔐 Testing Password:');
    console.log('  Testing password:', testPassword);
    
    if (!admin.password) {
      console.log('  ❌ Password field is empty!');
    } else {
      const isMatch = await admin.comparePassword(testPassword);
      console.log('  Password Match:', isMatch ? '✅ YES' : '❌ NO');
      
      if (!isMatch) {
        console.log('\n⚠️  Password does not match!');
        console.log('  This could mean:');
        console.log('    1. The password was changed');
        console.log('    2. The seed script used a different password');
        console.log('    3. There is a password hashing issue');
      }
    }

    // Reset if locked
    if (admin.isLocked()) {
      console.log('\n🔓 Account is locked. Resetting...');
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();
      console.log('✅ Account unlocked!');
    }

    // Reset login attempts
    if (admin.loginAttempts > 0) {
      console.log('\n🔄 Resetting login attempts...');
      admin.loginAttempts = 0;
      await admin.save();
      console.log('✅ Login attempts reset!');
    }

    console.log('\n✅ Admin account check complete!');
    console.log('\n📝 Login Credentials:');
    console.log('  Email: admin@cooltech.com');
    console.log('  Password: Admin123!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkAdmin();

