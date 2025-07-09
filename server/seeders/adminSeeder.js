import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_donation');
    console.log('Connected to MongoDB for seeding...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@swarnandhra.edu' },
        { rollNumber: 'ADMIN001' }
      ]
    });

    if (existingAdmin) {
      console.log('Default admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Create default admin user
    const adminData = {
      rollNumber: 'ADMIN001',
      email: 'admin@swarnandhra.edu',
      password: 'admin123456', // This will be hashed by the User model
      fullName: 'System Administrator',
      department: 'Administration',
      year: 4,
      phone: '+91-1234567890',
      role: 'admin',
      isActive: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Default admin user created successfully!');
    console.log('==========================================');
    console.log('Admin Login Credentials:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`Role: ${adminData.role}`);
    console.log('==========================================');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

createDefaultAdmin();