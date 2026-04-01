require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const troubleshootLogin = async () => {
  try {
    console.log('🔍 Troubleshooting Admin Login Issues...\n');
    
    // Step 1: Check MongoDB connection
    console.log('1️⃣ Checking MongoDB connection...');
    try {
      await connectDB();
      console.log('   ✅ MongoDB connection successful\n');
    } catch (error) {
      console.log('   ❌ MongoDB connection failed!');
      console.log('   Error:', error.message);
      console.log('\n💡 Solution: Make sure MongoDB is running');
      console.log('   - Windows: Check MongoDB service or run: mongod');
      console.log('   - Verify MONGO_URI in .env file:', process.env.MONGO_URI);
      process.exit(1);
    }

    // Step 2: Check if admin exists
    console.log('2️⃣ Checking if admin account exists...');
    const admin = await User.findOne({ email: 'admin@cooltech.com' }).select('+password');
    
    if (!admin) {
      console.log('   ❌ Admin account not found!\n');
      console.log('💡 Solution: Run the seed script:');
      console.log('   npm run seed');
      await mongoose.connection.close();
      process.exit(1);
    }
    console.log('   ✅ Admin account found\n');

    // Step 3: Check account status
    console.log('3️⃣ Checking account status...');
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Is Active:', admin.isActive);
    console.log('   Login Attempts:', admin.loginAttempts);
    console.log('   Lock Until:', admin.lockUntil || 'Not locked');
    console.log('   Account Locked:', admin.isLocked() ? '❌ YES' : '✅ NO');
    
    if (!admin.isActive) {
      console.log('\n   ⚠️  Account is deactivated!');
      admin.isActive = true;
      await admin.save();
      console.log('   ✅ Account reactivated');
    }

    if (admin.isLocked()) {
      console.log('\n   ⚠️  Account is locked! Unlocking...');
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();
      console.log('   ✅ Account unlocked');
    }

    if (admin.loginAttempts > 0) {
      console.log('\n   ⚠️  Resetting login attempts...');
      admin.loginAttempts = 0;
      await admin.save();
      console.log('   ✅ Login attempts reset');
    }

    // Step 4: Test password
    console.log('\n4️⃣ Testing password...');
    if (!admin.password) {
      console.log('   ❌ Password not set! Resetting...');
      admin.password = 'Admin123!';
      await admin.save();
      console.log('   ✅ Password set to: Admin123!');
    } else {
      const testPassword = 'Admin123!';
      const isMatch = await admin.comparePassword(testPassword);
      if (!isMatch) {
        console.log('   ❌ Password does not match! Resetting...');
        admin.password = 'Admin123!';
        admin.loginAttempts = 0;
        admin.lockUntil = undefined;
        await admin.save();
        console.log('   ✅ Password reset to: Admin123!');
      } else {
        console.log('   ✅ Password is correct');
      }
    }

    // Step 5: Final summary
    console.log('\n✅ Troubleshooting Complete!\n');
    console.log('📝 Login Credentials:');
    console.log('   Email: admin@cooltech.com');
    console.log('   Password: Admin123!');
    console.log('\n💡 If login still fails, check:');
    console.log('   1. Backend server is running (npm run dev in backend folder)');
    console.log('   2. Frontend is connecting to correct backend URL');
    console.log('   3. Check browser console for errors');
    console.log('   4. Verify CORS settings in backend');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during troubleshooting:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

troubleshootLogin();

