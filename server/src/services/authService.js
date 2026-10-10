const mongoose = require('mongoose');
const CollegeMember = require('../models/CollegeMember');
const generateToken = require('../utils/generateToken');
const devStore = require('./devStore');

/**
 * Check whether a PRN + email pair exists in the authorized member list.
 * @param {string} prn
 * @param {string} email
 * @returns {Promise<CollegeMember|Object|null>}
 */
const checkEligibility = async (prn, email) => {
  const cleanPrn = (prn || '').trim().toUpperCase();
  const cleanEmail = (email || '').trim().toLowerCase();

  // If connected to MongoDB, query CollegeMember collection
  if (mongoose.connection.readyState === 1) {
    const member = await CollegeMember.findOne({
      prn: cleanPrn,
      email: cleanEmail,
      isActive: true,
    });

    if (member) return member;

    // In development mode, if the CollegeMember collection is empty, check devStore
    if (process.env.NODE_ENV === 'development') {
      const count = await CollegeMember.countDocuments();
      if (count === 0) {
        return devStore.findMember(cleanPrn, cleanEmail);
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
