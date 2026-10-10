const mongoose = require('mongoose');
const { MATCH_STATUSES } = require('../utils/constants');

const matchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: Object.values(MATCH_STATUSES),
      default: MATCH_STATUSES.SUGGESTED,
    },
  },
  { timestamps: true }
);

matchSchema.index({ lostItemId: 1, foundItemId: 1 });

module.exports = mongoose.model('Match', matchSchema);
