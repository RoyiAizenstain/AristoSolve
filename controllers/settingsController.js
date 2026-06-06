const settings = require('../models/settings');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_THEMES = ['light', 'dark'];

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const resolveUserId = (req) => {
  const id = parseInt(req.headers['x-user-id']);
  return isNaN(id) ? null : id;
};

const get = (req, res) => {
  const userId = resolveUserId(req);
  if (!userId) return fail(res, 400, 'VALIDATION_ERROR', 'x-user-id header is required');

  const record = settings.findByUserId(userId);
  if (!record) return fail(res, 404, 'NOT_FOUND', `Settings for user ${userId} not found`);
  ok(res, record);
};

const update = (req, res) => {
  const userId = resolveUserId(req);
  if (!userId) return fail(res, 400, 'VALIDATION_ERROR', 'x-user-id header is required');

  const { displayName, email, theme } = req.body;

  if (displayName !== undefined && !displayName.trim())
    return fail(res, 400, 'VALIDATION_ERROR', 'displayName cannot be empty');
  if (email !== undefined && !EMAIL_RE.test(email))
    return fail(res, 400, 'VALIDATION_ERROR', 'email must be a valid email address');
  if (theme !== undefined && !VALID_THEMES.includes(theme))
    return fail(res, 400, 'VALIDATION_ERROR', `theme must be one of: ${VALID_THEMES.join(', ')}`);

  const record = settings.upsert(userId, req.body);
  if (!record) return fail(res, 404, 'NOT_FOUND', `Settings for user ${userId} not found`);
  ok(res, record);
};

module.exports = { get, update };
