/**
 * LEXVRA HRMS - Admin Seed Script
 * Creates Admin + HR user in MongoDB if they don't exist
 * Run: node seedAdmin.js
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://infinologylexvra_db_user:0lwvLNuueDINgUPA@cluster0.zxmnjlc.mongodb.net/lexvra_payroll?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Load models
    const User = require('./src/models/User');
    const Role = require('./src/models/Role');
    const Employee = require('./src/models/Employee');

    // ─── 1. Ensure Roles exist ───────────────────────────────────────────
    let adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'ADMIN',
        displayName: 'Administrator',
        permissions: {
          employees: { read: true, create: true, update: true, delete: true },
          attendance: { read: true, create: true, update: true, delete: true },
          leaves: { read: true, approve: true },
          payroll: { read: true, create: true, update: true },
          reports: { read: true }
        }
      });
      console.log('✅ ADMIN role created');
    } else {
      console.log('ℹ️  ADMIN role already exists');
    }

    let hrRole = await Role.findOne({ name: 'HR' });
    if (!hrRole) {
      hrRole = await Role.create({
        name: 'HR',
        displayName: 'Human Resources',
        permissions: {
          employees: { read: true, create: true, update: true },
          attendance: { read: true, update: true },
          leaves: { read: true, approve: true },
          payroll: { read: true },
          reports: { read: true }
        }
      });
      console.log('✅ HR role created');
    } else {
      console.log('ℹ️  HR role already exists');
    }

    let empRole = await Role.findOne({ name: 'EMPLOYEE' });
    if (!empRole) {
      empRole = await Role.create({
        name: 'EMPLOYEE',
        displayName: 'Employee',
        permissions: {
          employees: { read: false },
          attendance: { read: true, create: true },
          leaves: { read: true, create: true },
          payroll: { read: true }
        }
      });
      console.log('✅ EMPLOYEE role created');
    } else {
      console.log('ℹ️  EMPLOYEE role already exists');
    }

    // ─── 2. Seed Admin User ──────────────────────────────────────────────
    const ADMIN_EMAIL = 'admin@lexvra.com';
    const ADMIN_PASSWORD = 'Admin@123';

    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      adminUser = await User.create({
        name: 'Lexvra Admin',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'ADMIN',
        roleRef: adminRole._id,
        isActive: true,
      });
      console.log('✅ Admin user created');
      console.log(`   Email   : ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else {
      // Always reset password so you can login
      const salt = await bcrypt.genSalt(10);
      adminUser.password = await bcrypt.hash(ADMIN_PASSWORD, salt);
      adminUser.role = 'ADMIN';
      adminUser.roleRef = adminRole._id;
      adminUser.isActive = true;
      await adminUser.save({ validateBeforeSave: false });
      console.log('♻️  Admin user password RESET');
      console.log(`   Email   : ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }

    // ─── 3. Seed HR User ─────────────────────────────────────────────────
    const HR_EMAIL = 'hr@lexvra.com';
    const HR_PASSWORD = 'Hr@123456';

    let hrUser = await User.findOne({ email: HR_EMAIL });
    if (!hrUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(HR_PASSWORD, salt);
      hrUser = await User.create({
        name: 'HR Manager',
        email: HR_EMAIL,
        password: hashedPassword,
        role: 'HR',
        roleRef: hrRole._id,
        isActive: true,
      });
      console.log('✅ HR user created');
    } else {
      const salt = await bcrypt.genSalt(10);
      hrUser.password = await bcrypt.hash(HR_PASSWORD, salt);
      hrUser.role = 'HR';
      hrUser.roleRef = hrRole._id;
      hrUser.isActive = true;
      await hrUser.save({ validateBeforeSave: false });
      console.log('♻️  HR user password RESET');
    }
    console.log(`   Email   : ${HR_EMAIL}`);
    console.log(`   Password: ${HR_PASSWORD}`);

    // ─── 4. Print all existing users ─────────────────────────────────────
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}).select('name email role isActive');
    allUsers.forEach(u => {
      console.log(`   [${u.role}] ${u.name} | ${u.email} | Active: ${u.isActive}`);
    });

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('─────────────────────────────────────');
    console.log('  LOGIN CREDENTIALS');
    console.log('─────────────────────────────────────');
    console.log(`  Admin : admin@lexvra.com / Admin@123`);
    console.log(`  HR    : hr@lexvra.com / Hr@123456`);
    console.log('─────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    if (err.code === 11000) {
      console.error('   Duplicate key - user already exists. Try running again.');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

seed();
