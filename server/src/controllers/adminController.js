const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const AuditLog = require('../models/AuditLog');
const devStore = require('../services/devStore');
const { updateClaimStatus } = require('../services/claimService');
const { createNotification } = require('../services/notificationService');
const writeAuditLog = require('../utils/auditLogger');
const { ITEM_STATUSES, CLAIM_STATUSES, USER_STATUSES, NOTIFICATION_TYPES } = require('../utils/constants');

// ─── Stats ────────────────────────────────────────────────────────────────────

const getStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: devStore.getStats() });
    }

    const [totalItems, lostItems, foundItems, returnedItems, totalUsers, pendingClaims] =
      await Promise.all([
        Item.countDocuments(),
        Item.countDocuments({ type: 'lost' }),
        Item.countDocuments({ type: 'found' }),
        Item.countDocuments({ status: ITEM_STATUSES.RETURNED }),
        User.countDocuments({ role: { $ne: 'admin' } }),
        Claim.countDocuments({ status: CLAIM_STATUSES.PENDING }),
      ]);

    return res.status(200).json({
      success: true,
      data: { totalItems, lostItems, foundItems, returnedItems, totalUsers, pendingClaims },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Reports ─────────────────────────────────────────────────────────────────

const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const { items, total } = devStore.getAdminReports({ status, type, page, limit });
      return res.status(200).json({
        success: true,
        data: items,
        pagination: { page: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
      });
    }

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('reporterId', 'name email prn')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Item.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: { page: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
    });
  } catch (err) {
    next(err);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const item = devStore.updateReportStatus(req.params.id, status);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      return res.status(200).json({ success: true, data: item });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const notifType =
      status === ITEM_STATUSES.ACTIVE
        ? NOTIFICATION_TYPES.REPORT_APPROVED
        : status === ITEM_STATUSES.REJECTED
        ? NOTIFICATION_TYPES.REPORT_REJECTED
        : null;

    if (notifType) {
      await createNotification({
        recipientId: item.reporterId,
        type: notifType,
        message:
          status === ITEM_STATUSES.ACTIVE
            ? `Your item report "${item.name}" has been approved and is now live.`
            : `Your item report "${item.name}" was reviewed and could not be approved.`,
        refId: item._id,
        refModel: 'Item',
      });
    }

    await writeAuditLog({ actorId: req.user.userId, actionType: `report_${status}`, targetId: item._id });

    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ─── Claims ───────────────────────────────────────────────────────────────────

const getClaims = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const { claims, total } = devStore.getAdminClaims({ status, page, limit });
      return res.status(200).json({
        success: true,
        data: claims,
        pagination: { page: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
      });
    }

    const query = {};
    if (status) query.status = status;

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate('claimantId', 'name email prn')
        .populate('itemId', 'name type category status')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Claim.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: claims,
      pagination: { page: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
    });
  } catch (err) {
    next(err);
  }
};

const updateClaim = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const claim = devStore.updateAdminClaim(req.params.id, status, req.user.userId, adminNote);
      if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });
      return res.status(200).json({ success: true, data: claim });
    }

    const claim = await updateClaimStatus({
      claimId: req.params.id,
      status,
      reviewerId: req.user.userId,
      adminNote,
    });
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    // Mark item as returned if claim is approved
    if (status === CLAIM_STATUSES.APPROVED) {
      const item = await Item.findByIdAndUpdate(
        claim.itemId,
        { status: ITEM_STATUSES.RETURNED },
        { new: true }
      );
      if (item) {
        await createNotification({
          recipientId: item.reporterId,
          type: NOTIFICATION_TYPES.ITEM_RETURNED,
          message: `The item "${item.name}" you reported has been returned to its owner.`,
          refId: item._id,
          refModel: 'Item',
        });
      }
    }

    await writeAuditLog({ actorId: req.user.userId, actionType: `claim_${status}`, targetId: claim._id });

    return res.status(200).json({ success: true, data: claim });
  } catch (err) {
    next(err);
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, role } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const { users, total } = devStore.getAdminUsers({ status, role, page, limit });
      return res.status(200).json({
        success: true,
        data: users,
        pagination: { page: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
      });
    }

    const query = { role: { $ne: 'admin' } };
    if (status) query.status = status;
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: { page: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!Object.values(USER_STATUSES).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    if (mongoose.connection.readyState !== 1) {
      const user = devStore.updateUserStatus(req.params.id, status);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, data: user });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await writeAuditLog({ actorId: req.user.userId, actionType: `user_${status}`, targetId: user._id });

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

const getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const logs = devStore.getAuditLogs();
      return res.status(200).json({
        success: true,
        data: logs,
        pagination: { page: Number(page), totalPages: 1, totalItems: logs.length },
      });
    }

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('actorId', 'name email role')
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      AuditLog.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: { page: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getReports, updateReport, getClaims, updateClaim, getUsers, updateUserStatus, getLogs };
