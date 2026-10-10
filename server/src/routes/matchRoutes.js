const express = require('express');
const router = express.Router();

const { getMatchesForItem } = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/item/:id', getMatchesForItem);

module.exports = router;
