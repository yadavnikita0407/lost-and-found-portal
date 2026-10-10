const jwt = require('jsonwebtoken');

/**
 * Sign and return a JWT for a given user.
 * @param {string} userId  - MongoDB ObjectId (as string)
 * @param {string} role    - User role ('student' | 'staff' | 'admin')
 * @returns {string} signed JWT
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
