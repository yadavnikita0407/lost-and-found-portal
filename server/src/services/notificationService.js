const Notification = require('../models/Notification');

/**
 * Create a notification document.
 * @param {object} opts
 * @param {string} opts.recipientId
 * @param {string} opts.type         - NOTIFICATION_TYPES constant
 * @param {string} opts.message
 * @param {string} [opts.refId]      - Related entity ID
 * @param {string} [opts.refModel]   - 'Item' | 'Claim' | 'Match'
 */
const createNotification = async ({ recipientId, type, message, refId = null, refModel = null }) => {
  return Notification.create({ recipientId, type, message, refId, refModel });
};

module.exports = { createNotification };
