const express = require('express');
const router = express.Router();

const {
  getStats,
  getReports, updateReport,
  getClaims, updateClaim,
  getUsers, updateUserStatus,
  getLogs,
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All admin routes require a valid JWT and the 'admin' role
router.use(authMiddleware, requireRole('admin'));

router.get('/stats', getStats);

router.get('/reports', getReports);
router.patch('/reports/:id', updateReport);

router.get('/claims', getClaims);
router.patch('/claims/:id', updateClaim);

router.get('/users', getUsers);
router.patch('/users/:id', updateUserStatus);

router.get('/logs', getLogs);

module.exports = router;
