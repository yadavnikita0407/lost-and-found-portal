const Claim = require('../models/Claim');
const { createNotification } = require('./notificationService');
const { CLAIM_STATUSES, NOTIFICATION_TYPES } = require('../utils/constants');

/**
 * Create a new claim for an item.
 */
const createClaim = async ({ itemId, claimantId, reason }) => {
  const claim = await Claim.create({ itemId, claimantId, reason });
  return claim;
};

/**
 * Update a claim's status (approve / reject) and notify the claimant.
 */
const updateClaimStatus = async ({ claimId, status, reviewerId, adminNote }) => {
  const claim = await Claim.findByIdAndUpdate(
    claimId,
    {
      status,
      reviewerId,
      reviewedAt: new Date(),
      ...(adminNote !== undefined && { adminNote }),
    },
    { new: true }
  );

  if (!claim) return null;

  const message =
    status === CLAIM_STATUSES.APPROVED
      ? 'Your ownership claim has been approved. Please collect your item from the admin.'
      : 'Your ownership claim has been reviewed and was not approved.';

  const type =
    status === CLAIM_STATUSES.APPROVED
      ? NOTIFICATION_TYPES.CLAIM_APPROVED
      : NOTIFICATION_TYPES.CLAIM_REJECTED;

  await createNotification({
    recipientId: claim.claimantId,
    type,
    message,
    refId: claim._id,
    refModel: 'Claim',
  });

  return claim;
};

module.exports = { createClaim, updateClaimStatus };
