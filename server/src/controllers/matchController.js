const mongoose = require('mongoose');
const Match = require('../models/Match');

/**
 * GET /api/matches/item/:id
 * Returns match suggestions for a given item ID.
 */
const getMatchesForItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Find matches where the item appears as either lost or found side
    const matches = await Match.find({
      $or: [{ lostItemId: id }, { foundItemId: id }],
      status: { $ne: 'dismissed' },
    })
      .populate('lostItemId', 'name category location dateReported colour brand photoUrl status')
      .populate('foundItemId', 'name category location dateReported colour brand photoUrl status')
      .sort({ score: -1 });

    return res.status(200).json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMatchesForItem };
