import mongoose from 'mongoose';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleUsers = [
  {
    rollNumber: 'CSE001',
    email: 'john.doe@swarnandhra.edu',
    password: 'password123',
    fullName: 'John Doe',
    department: 'Computer Science Engineering',
    year: 3,
    phone: '+91-9876543210',
    role: 'student'
  },
  {
    rollNumber: 'ECE002',
    email: 'jane.smith@swarnandhra.edu',
    password: 'password123',
    fullName: 'Jane Smith',
    department: 'Electronics and Communication Engineering',
    year: 2,
    phone: '+91-9876543211',
    role: 'student'
  },
  {
    rollNumber: 'MECH003',
    email: 'mike.wilson@swarnandhra.edu',
    password: 'password123',
    fullName: 'Mike Wilson',
    department: 'Mechanical Engineering',
    year: 4,
    phone: '+91-9876543212',
    role: 'student'
  },
  {
    rollNumber: 'CIVIL004',
    email: 'sarah.brown@swarnandhra.edu',
    password: 'password123',
    fullName: 'Sarah Brown',
    department: 'Civil Engineering',
    year: 1,
    phone: '+91-9876543213',
    role: 'student'
  }
];

const sampleDonors = [
  {
    bloodGroup: 'O+',
    weight: 70,
    lastDonationDate: new Date('2024-01-15'),
    medicalConditions: [],
    availability: 'always',
    totalDonations: 5
  },
  {
    bloodGroup: 'A+',
    weight: 65,
    lastDonationDate: null,
    medicalConditions: [],
    availability: 'emergency',
    totalDonations: 0
  },
  {
    bloodGroup: 'B+',
    weight: 75,
    lastDonationDate: new Date('2024-03-20'),
    medicalConditions: ['Diabetes'],
    availability: 'monthly',
    totalDonations: 3
  },
  {
    bloodGroup: 'AB+',
    weight: 68,
    lastDonationDate: null,
    medicalConditions: [],
    availability: 'always',
    totalDonations: 0
  }
];

const sampleRequests = [
  {
    patientName: 'Emergency Patient 1',
    bloodGroup: 'O+',
    unitsNeeded: 2,
    urgency: 'critical',
    requiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    hospital: 'Swarnandhra Medical Center',
    contactPerson: 'Dr. Emergency',
    contactPhone: '+91-9999999999',
    contactEmail: 'emergency@hospital.com',
    reason: 'Accident - Major blood loss',
    status: 'pending'
  },
  {
    patientName: 'Surgery Patient',
    bloodGroup: 'A+',
    unitsNeeded: 1,
    urgency: 'high',
    requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    hospital: 'City General Hospital',
    contactPerson: 'Dr. Surgeon',
    contactPhone: '+91-8888888888',
    contactEmail: 'surgery@hospital.com',
    reason: 'Scheduled surgery',
    status: 'pending'
  }
];

const seedSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_donation');
    console.log('Connected to MongoDB for seeding sample data...');

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('Clearing existing sample data...');
    await User.deleteMany({ role: 'student' });
    await Donor.deleteMany({});
    await BloodRequest.deleteMany({});

    // Create sample users
    console.log('Creating sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.fullName} (${user.email})`);
    }

    // Create sample donors
    console.log('Creating sample donors...');
    for (let i = 0; i < sampleDonors.length; i++) {
      const donorData = {
        ...sampleDonors[i],
        user: createdUsers[i]._id
      };
      const donor = new Donor(donorData);
      await donor.save();
      console.log(`✅ Created donor: ${createdUsers[i].fullName} - ${donor.bloodGroup}`);
    }

    // Create sample blood requests
    console.log('Creating sample blood requests...');
    for (const requestData of sampleRequests) {
      const request = new BloodRequest(requestData);
      await request.save();
      console.log(`✅ Created blood request: ${request.patientName} - ${request.bloodGroup}`);
    }

    console.log('==========================================');
    console.log('✅ Sample data seeded successfully!');
    console.log('==========================================');
    console.log('Sample Student Login Credentials:');
    console.log('Email: john.doe@swarnandhra.edu');
    console.log('Password: password123');
    console.log('');
    console.log('Email: jane.smith@swarnandhra.edu');
    console.log('Password: password123');
    console.log('==========================================');

  } catch (error) {
    console.error('Error seeding sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedSampleData();