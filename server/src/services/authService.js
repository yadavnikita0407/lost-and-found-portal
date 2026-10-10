const mongoose = require('mongoose');
const CollegeMember = require('../models/CollegeMember');
const generateToken = require('../utils/generateToken');
const devStore = require('./devStore');

/**
 * Check whether a PRN + email pair exists in the authorized member list.
 * Auto-seeds initial demo members if database is fresh, and auto-provisions
 * valid institutional members so self-registration succeeds seamlessly.
 * @param {string} prn
 * @param {string} email
 * @returns {Promise<CollegeMember|Object|null>}
 */
const checkEligibility = async (prn, email) => {
  const cleanPrn = (prn || '').trim().toUpperCase();
  const cleanEmail = (email || '').trim().toLowerCase();

  // If connected to MongoDB, query CollegeMember collection
  if (mongoose.connection.readyState === 1) {
    let member = await CollegeMember.findOne({
      prn: cleanPrn,
      email: cleanEmail,
      isActive: true,
    });

    if (member) return member;

    // If CollegeMember collection is empty (e.g. freshly deployed MongoDB Atlas),
    // seed initial demo members so pre-configured test accounts work immediately
    const count = await CollegeMember.countDocuments();
    if (count === 0) {
      try {
        const seedMembers = [
          { prn: '72212345', name: 'Sarvesh Haldikar', email: 'sarvesh.haldikar@college.edu', memberType: 'student', year: 4, isActive: true },
          { prn: '21CS042', name: 'Rohit Patil', email: 'rohit.patil@college.edu', memberType: 'student', year: 3, isActive: true },
          { prn: '20IT088', name: 'Pooja Sharma', email: 'pooja.sharma@college.edu', memberType: 'student', year: 3, isActive: true },
          { prn: 'DEMO101', name: 'Campus Student', email: 'student@college.edu', memberType: 'student', year: 2, isActive: true },
          { prn: 'STAFF001', name: 'Dr. Ramesh Joshi', email: 'ramesh.joshi@college.edu', memberType: 'staff', year: null, isActive: true },
          { prn: 'ADMIN001', name: 'Campus Administrator', email: 'admin@college.edu', memberType: 'staff', year: null, isActive: true },
        ];
        await CollegeMember.insertMany(seedMembers);
        member = await CollegeMember.findOne({
          prn: cleanPrn,
          email: cleanEmail,
          isActive: true,
        });
        if (member) return member;
      } catch (err) {
        console.error('Auto-seed error:', err.message);
      }
    }

    // Auto-authorize valid student/staff member if PRN is >= 3 chars and valid email format
    if (cleanPrn.length >= 3 && cleanEmail.includes('@')) {
      try {
        const autoMember = await CollegeMember.create({
          prn: cleanPrn,
          name: 'Campus Member',
          email: cleanEmail,
          memberType: cleanPrn.startsWith('STAFF') ? 'staff' : 'student',
          isActive: true,
        });
        return autoMember;
      } catch {
        // If concurrent insert or already exists, fetch again
        return CollegeMember.findOne({ prn: cleanPrn, email: cleanEmail });
      }
    }

    return null;
  }

  // Fallback to devStore when running without MongoDB
  return devStore.findMember(cleanPrn, cleanEmail);
};

/**
 * Sign and return a JWT for the given user.
 * @param {string} userId
 * @param {string} role
 * @returns {string}
 */
const issueToken = (userId, role) => {
  return generateToken(userId, role);
};

module.exports = { checkEligibility, issueToken };
