require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CollegeMember = require('../models/CollegeMember');
const User = require('../models/User');
const { ROLES, MEMBER_TYPES } = require('../utils/constants');

const members = [
  {
    prn: '72212345',
    name: 'Sarvesh Haldikar',
    email: 'sarvesh.haldikar@college.edu',
    memberType: MEMBER_TYPES.STUDENT,
    year: 4,
    isActive: true,
  },
  {
    prn: '21CS042',
    name: 'Rohit Patil',
    email: 'rohit.patil@college.edu',
    memberType: MEMBER_TYPES.STUDENT,
    year: 3,
    isActive: true,
  },
  {
    prn: '20IT088',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@college.edu',
    memberType: MEMBER_TYPES.STUDENT,
    year: 3,
    isActive: true,
  },
  {
    prn: 'DEMO101',
    name: 'Campus Student',
    email: 'student@college.edu',
    memberType: MEMBER_TYPES.STUDENT,
    year: 2,
    isActive: true,
  },
  {
    prn: 'STAFF001',
    name: 'Dr. Ramesh Joshi',
    email: 'ramesh.joshi@college.edu',
    memberType: MEMBER_TYPES.STAFF,
    year: null,
    isActive: true,
  },
  {
    prn: 'ADMIN001',
    name: 'Campus Administrator',
    email: 'admin@college.edu',
    memberType: MEMBER_TYPES.STAFF,
    year: null,
    isActive: true,
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<user>') || uri.includes('<password>')) {
    console.error('Please configure a valid MONGO_URI in server/.env before seeding.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

    console.log('Clearing existing CollegeMembers and Users...');
    await CollegeMember.deleteMany({});
    await User.deleteMany({});

    console.log('Seeding authorized CollegeMembers...');
    await CollegeMember.insertMany(members);

    console.log('Seeding default Users...');
    const defaultPasswordHash = await bcrypt.hash('Password123', 12);

    await User.create([
      {
        name: 'Campus Administrator',
        prn: 'ADMIN001',
        email: 'admin@college.edu',
        mobile: '9876543210',
        passwordHash: defaultPasswordHash,
        role: ROLES.ADMIN,
        status: 'active',
      },
      {
        name: 'Campus Student',
        prn: 'DEMO101',
        email: 'student@college.edu',
        mobile: '9876543211',
        passwordHash: defaultPasswordHash,
        role: ROLES.STUDENT,
        status: 'active',
      },
    ]);

    console.log('\nSeeding completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Authorized Members available to register:');
    members.forEach((m) => {
      console.log(`  - [${m.memberType}] PRN: ${m.prn} | Email: ${m.email} (${m.name})`);
    });
    console.log('\nPre-created accounts (Password: Password123):');
    console.log('  - Student: student@college.edu');
    console.log('  - Admin:   admin@college.edu');
    console.log('--------------------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
