const mongoose = require('mongoose');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const devStore = require('../services/devStore');
const { createClaim } = require('../services/claimService');
const { createNotification } = require('../services/notificationService');
const { NOTIFICATION_TYPES, ROLES } = require('../utils/constants');

/**
 * POST /api/claims
 */
const createClaimHandler = async (req, res, next) => {
  try {
    const { itemId, reason } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const claim = devStore.createClaim(itemId, reason, req.user.userId);
      return res.status(201).json({ success: true, data: claim });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Prevent reporter from claiming their own item
    if (item.reporterId.toString() === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own report' });
    }

    // Check for existing claim
    const existing = await Claim.findOne({ itemId, claimantId: req.user.userId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted a claim for this item' });
    }

    const claim = await createClaim({ itemId, claimantId: req.user.userId, reason });

    // Notify reporter
    await createNotification({
      recipientId: item.reporterId,
      type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
      message: `A new ownership claim has been submitted for your item "${item.name}".`,
      refId: claim._id,
      refModel: 'Claim',
    });

    return res.status(201).json({ success: true, data: claim });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/claims/my
 */
const getMyClaims = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const claims = devStore.getMyClaims(req.user.userId);
      return res.status(200).json({ success: true, data: claims });
    }

    const claims = await Claim.find({ claimantId: req.user.userId })
      .populate('itemId', 'name type category status photoUrl')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: claims });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/claims/:id
 */
const getClaimById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const claim = devStore.claims.find((c) => String(c._id) === String(req.params.id));
      if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });
      return res.status(200).json({ success: true, data: claim });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('itemId', 'name type category status reporterId')
      .populate('claimantId', 'name email');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const isClaimant = claim.claimantId._id.toString() === req.user.userId;
    const isReporter = claim.itemId.reporterId.toString() === req.user.userId;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isClaimant && !isReporter && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, data: claim });
  } catch (err) {
    next(err);
  }
};

module.exports = { createClaim: createClaimHandler, getMyClaims, getClaimById };
