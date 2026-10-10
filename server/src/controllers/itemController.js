const mongoose = require('mongoose');
const Item = require('../models/Item');
const devStore = require('../services/devStore');
const { searchItems } = require('../services/itemService');
const { generateMatches } = require('../services/matchService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/uploadService');
const { createNotification } = require('../services/notificationService');
const { ITEM_STATUSES, ROLES, NOTIFICATION_TYPES } = require('../utils/constants');

/**
 * POST /api/items
 * Create a new lost or found item report.
 */
const createItem = async (req, res, next) => {
  try {
    const { type, name, category, description, location, dateReported, colour, brand, uniqueDetails } = req.body;

    let photoUrl = null;
    let photoPublicId = null;

    if (req.file) {
      const { secure_url, public_id } = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      photoUrl = secure_url;
      photoPublicId = public_id;
    }

    if (mongoose.connection.readyState !== 1) {
      const item = devStore.createItem(
        { type, name, category, description, location, dateReported, colour, brand, uniqueDetails, photoUrl },
        req.user.userId
      );
      return res.status(201).json({ success: true, data: item });
    }

    const item = await Item.create({
      reporterId: req.user.userId,
      type, name, category, description, location, dateReported, colour, brand, uniqueDetails,
      photoUrl, photoPublicId,
    });

    // Notify reporter that report is pending admin review
    await createNotification({
      recipientId: req.user.userId,
      type: NOTIFICATION_TYPES.REPORT_APPROVED, // reuse as "submitted" placeholder
      message: `Your ${type} item report for "${name}" has been submitted and is pending review.`,
      refId: item._id,
      refModel: 'Item',
    });

    // Run match engine asynchronously — no need to await
    generateMatches(item);

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/items
 * Paginated search with filters.
 */
const getItems = async (req, res, next) => {
  try {
    const { keyword, category, type, location, status, dateFrom, dateTo, page, limit, reporterId } = req.query;
    const { items, total } = await searchItems({ keyword, category, type, location, status, dateFrom, dateTo, page, limit, reporterId });

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: Number(page) || 1,
        totalPages: Math.ceil(total / (Number(limit) || 10)),
        totalItems: total,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/items/:id
 */
const getItemById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const item = devStore.findItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.status(200).json({ success: true, data: item });
    }

    const item = await Item.findById(req.params.id).populate('reporterId', 'name email');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Mask sensitive contact fields for non-owners / non-admins
    const isOwnerOrAdmin =
      req.user.role === ROLES.ADMIN ||
      item.reporterId._id.toString() === req.user.userId;

    const response = item.toObject();
    if (!isOwnerOrAdmin) {
      delete response.reporterId.email;
      delete response.uniqueDetails;
    }

    return res.status(200).json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/items/:id — owner or admin only
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const isOwner = item.reporterId.toString() === req.user.userId;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised to update this item' });
    }

    // Handle image replacement
    if (req.file) {
      if (item.photoPublicId) await deleteFromCloudinary(item.photoPublicId);
      const { secure_url, public_id } = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      req.body.photoUrl = secure_url;
      req.body.photoPublicId = public_id;
    }

    const allowedFields = ['name', 'category', 'description', 'location', 'dateReported',
                           'colour', 'brand', 'uniqueDetails', 'photoUrl', 'photoPublicId'];
    if (isAdmin) allowedFields.push('status');

    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const updated = await Item.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/items/:id — admin or owner (pending status only)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const isOwner = item.reporterId.toString() === req.user.userId;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isAdmin && (!isOwner || item.status !== ITEM_STATUSES.PENDING)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own pending reports',
      });
    }

    if (item.photoPublicId) await deleteFromCloudinary(item.photoPublicId);
    await item.deleteOne();

    return res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem };
