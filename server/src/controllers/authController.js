const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { checkEligibility, issueToken } = require('../services/authService');
const devStore = require('../services/devStore');
const { ROLES } = require('../utils/constants');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, prn, email, mobile, password } = req.body;
    const cleanPrn = (prn || '').trim().toUpperCase();
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Ensure the PRN+email pair is in the authorized member list
    const member = await checkEligibility(cleanPrn, cleanEmail);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'Registration not allowed: PRN and email not found in the authorized member list.',
      });
    }

    // 2. Check for duplicate accounts
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({
        $or: [{ email: cleanEmail }, { prn: cleanPrn }],
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email or PRN already exists.',
        });
      }

      // 3. Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // 4. Create user — role derived from member type
      const role = member.memberType === 'staff' ? ROLES.STAFF : ROLES.STUDENT;
      const user = await User.create({
        name,
        prn: cleanPrn,
        email: cleanEmail,
        mobile,
        passwordHash,
        role,
      });

      const token = issueToken(user._id, user.role);

      return res.status(201).json({
        success: true,
        data: {
          token,
          user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        },
      });
    } else {
      // DevStore fallback
      const existing = devStore.findUserByPrnOrEmail(cleanPrn, cleanEmail);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email or PRN already exists.',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const role = member.memberType === 'staff' ? ROLES.STAFF : ROLES.STUDENT;
      const user = devStore.createUser({
        name,
        prn: cleanPrn,
        email: cleanEmail,
        mobile,
        passwordHash,
        role,
      });

      const token = issueToken(user._id, user.role);

      return res.status(201).json({
        success: true,
        data: {
          token,
          user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = devStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = issueToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user.userId).select('-passwordHash');
    } else {
      user = devStore.findUserById(req.user.userId);
      if (user) {
        // eslint-disable-next-line no-unused-vars
        const { passwordHash, ...cleanUser } = user;
        user = cleanUser;
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
