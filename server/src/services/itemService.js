const mongoose = require('mongoose');
const Item = require('../models/Item');
const devStore = require('./devStore');

/**
 * Paginated item search with keyword + filters.
 * @param {object} params
 * @returns {Promise<{ items: Item[], total: number }>}
 */
const searchItems = async ({
  keyword,
  category,
  type,
  location,
  status,
  reporterId,
  dateFrom,
  dateTo,
  page = 1,
  limit = 10,
}) => {
  if (mongoose.connection.readyState !== 1) {
    return devStore.searchItems({ keyword, category, type, location, status, reporterId, page, limit });
  }

  const query = {};

  if (reporterId) query.reporterId = reporterId;
  if (type) query.type = type;
  if (category) query.category = category;
  if (status) query.status = status;
  if (location) query.location = { $regex: location, $options: 'i' };

  if (dateFrom || dateTo) {
    query.dateReported = {};
    if (dateFrom) query.dateReported.$gte = new Date(dateFrom);
    if (dateTo) query.dateReported.$lte = new Date(dateTo);
  }

  // Full-text search when a keyword is supplied
  if (keyword) {
    query.$text = { $search: keyword };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Item.find(query)
      .sort(keyword ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('reporterId', 'name'),
    Item.countDocuments(query),
  ]);

  return { items, total };
};

module.exports = { searchItems };
