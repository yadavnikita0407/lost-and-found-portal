const mongoose = require('mongoose');
const { CLAIM_STATUSES } = require('../utils/constants');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Claim reason is required'],
      trim: true,
      minlength: [10, 'Claim reason must be at least 10 characters'],
    },
    status: {
      type: String,
      enum: Object.values(CLAIM_STATUSES),
      default: CLAIM_STATUSES.PENDING,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate claims from the same user on the same item
claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);
