const auth = (roles) => (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (!role || !roles.includes(role)) {
    return res.status(403).json({
      success: false,
      data: null,
      error: { code: 'FORBIDDEN', message: 'Access denied', details: {} }
    });
  }
  next();
};

module.exports = auth;
