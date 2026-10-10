const express = require('express');
const router = express.Router();

const {
  getNotifications, markAsRead, markAllAsRead,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// /read-all must be placed before /:id/read to avoid routing conflicts
router.patch('/read-all', markAllAsRead);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;
