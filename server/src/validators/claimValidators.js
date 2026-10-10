const { body } = require('express-validator');

const createClaimValidator = [
  body('itemId')
    .notEmpty()
    .withMessage('itemId is required')
    .isMongoId()
    .withMessage('itemId must be a valid ID'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Claim reason is required')
    .isLength({ min: 10 })
    .withMessage('Claim reason must be at least 10 characters'),
];

module.exports = { createClaimValidator };
