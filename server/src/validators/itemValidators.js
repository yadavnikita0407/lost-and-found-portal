const { body } = require('express-validator');
const { ITEM_TYPES, ITEM_CATEGORIES } = require('../utils/constants');

const createItemValidator = [
  body('type')
    .isIn(Object.values(ITEM_TYPES))
    .withMessage('type must be "lost" or "found"'),
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('category')
    .isIn(ITEM_CATEGORIES)
    .withMessage('Invalid category'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or fewer'),
  body('dateReported')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

const updateItemValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('category')
    .optional()
    .isIn(ITEM_CATEGORIES)
    .withMessage('Invalid category'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or fewer'),
];

module.exports = { createItemValidator, updateItemValidator };
