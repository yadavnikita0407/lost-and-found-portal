const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('prn')
    .trim()
    .notEmpty()
    .withMessage('PRN is required')
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('PRN must be alphanumeric'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobile')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid mobile number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
