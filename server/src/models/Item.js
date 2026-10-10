const mongoose = require('mongoose');
const { ITEM_TYPES, ITEM_STATUSES, ITEM_CATEGORIES } = require('../utils/constants');

const itemSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ITEM_TYPES),
      required: [true, 'Item type (lost/found) is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ITEM_CATEGORIES,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be 1000 characters or fewer'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    dateReported: {
      type: Date,
      default: Date.now,
    },
    colour: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    uniqueDetails: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    photoPublicId: {
      // Cloudinary public_id for deletion
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ITEM_STATUSES),
      default: ITEM_STATUSES.PENDING,
    },
  },
  { timestamps: true }
);

// Compound index for type/category/status filtering
itemSchema.index({ type: 1, category: 1, status: 1 });
// Full-text search index
itemSchema.index({ name: 'text', description: 'text', brand: 'text' });
// Location + date index
itemSchema.index({ location: 1, dateReported: -1 });

module.exports = mongoose.model('Item', itemSchema);
