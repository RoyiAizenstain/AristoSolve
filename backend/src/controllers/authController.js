const { User } = require('../../models/index');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 400, 'VALIDATION_ERROR', 'email and password are required');
  if (!EMAIL_RE.test(email)) return fail(res, 400, 'VALIDATION_ERROR', 'email must be a valid email address');
  try {
    const user = await User.findOne({ where: { email, password } });
    if (!user) return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    const { password: _, ...safe } = user.toJSON();
    ok(res, safe);
  } catch (e) {
    fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

const logout = (req, res) => ok(res, { message: 'Logged out' });

module.exports = { login, logout };
