const express = require('express');
const router = express.Router();

const {
  createClaim, getMyClaims, getClaimById,
} = require('../controllers/claimController');

const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { createClaimValidator } = require('../validators/claimValidators');

router.use(authMiddleware);

// /my must come before /:id to avoid Mongoose casting 'my' as an ObjectId
router.get('/my', getMyClaims);
router.post('/', createClaimValidator, validate, createClaim);
router.get('/:id', getClaimById);

module.exports = router;
