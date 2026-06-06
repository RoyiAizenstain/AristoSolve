const users = require('../models/users');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

// Strip the password before returning a user to the client.
const sanitize = ({ password, ...rest }) => rest;

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return fail(res, 400, 'VALIDATION_ERROR', 'email and password are required');
  if (!EMAIL_RE.test(email))
    return fail(res, 400, 'VALIDATION_ERROR', 'email must be a valid email address');

  const user = users.findAll().find(u => u.email === email && u.password === password);
  if (!user)
    return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  ok(res, sanitize(user));
};

// No real session to tear down — acknowledge so the client can clear localStorage.
const logout = (req, res) => {
  ok(res, { message: 'Logged out' });
};

module.exports = { login, logout };
