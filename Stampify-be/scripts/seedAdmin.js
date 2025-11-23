const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AdminUser = require('../models/AdminUser');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Seed script to create the first admin user
 * Usage: node scripts/seedAdmin.js
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email: process.env.ADMIN_EMAIL || 'brahim@stampify.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', existingAdmin.email);
      console.log('   If you want to create a new admin, use a different email or delete the existing one.');
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'brahim@stampify.com',
      password: process.env.ADMIN_PASSWORD || 'stampifyadmin*',
      role: 'admin'
    };

    const admin = new AdminUser(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email:', admin.email);
    console.log('   Password:', adminData.password);
    console.log('   Role:', admin.role);
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    console.log('   You can set ADMIN_EMAIL and ADMIN_PASSWORD in .env file for custom values.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run seed script
seedAdmin();

