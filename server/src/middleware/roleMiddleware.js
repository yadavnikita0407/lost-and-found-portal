/**
 * Role-based access guard.
 * Usage: router.get('/admin', authMiddleware, requireRole('admin'), handler)
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
      });
    }
    next();
  };
};

module.exports = requireRole;
