const AuditLog = require('../models/AuditLog');

/**
 * Write an audit log entry.
 * @param {object} opts
 * @param {string} opts.actorId    - User who performed the action
 * @param {string} opts.actionType - Short string describing the action
 * @param {string} [opts.targetId] - ID of the entity acted upon
 * @param {object} [opts.meta]     - Any extra context (role, etc.)
 */
const writeAuditLog = async ({ actorId, actionType, targetId = null, meta = {} }) => {
  try {
    await AuditLog.create({ actorId, actionType, targetId, meta });
  } catch (err) {
    // Non-fatal — log to console but do not crash the request
    console.error('AuditLog write failed:', err.message);
  }
};

module.exports = writeAuditLog;
