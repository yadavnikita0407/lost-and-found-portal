const mongoose = require('mongoose');
const { MEMBER_TYPES } = require('../utils/constants');

/**
 * CollegeMember — the authorized member list.
 * Registration eligibility is checked against this collection.
 */
const collegeMemberSchema = new mongoose.Schema(
  {
    prn: {
      type: String,
      required: [true, 'PRN is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    memberType: {
      type: String,
      enum: Object.values(MEMBER_TYPES),
      default: MEMBER_TYPES.STUDENT,
    },
    year: {
      type: Number, // 1–4 for students; null for staff
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CollegeMember', collegeMemberSchema);
