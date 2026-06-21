const { Settings, User } = require('../../models/index');

const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_THEMES = ['light', 'dark'];

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const get = async (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  if (isNaN(userId)) return fail(res, 400, 'VALIDATION_ERROR', 'x-user-id header is required');
  try {
    let record = await Settings.findOne({ where: { userId } });
    if (!record) {
      // auto-create from user data on first access
      const user = await User.findByPk(userId);
      if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found');
      record = await Settings.create({
        userId,
        displayName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        theme: 'dark',
        emailNotifications: true,
      });
    }
    ok(res, record);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const update = async (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  if (isNaN(userId)) return fail(res, 400, 'VALIDATION_ERROR', 'x-user-id header is required');
  const { displayName, email, theme } = req.body;
  if (displayName !== undefined && !displayName.trim()) return fail(res, 400, 'VALIDATION_ERROR', 'displayName cannot be empty');
  if (email !== undefined && !EMAIL_RE.test(email)) return fail(res, 400, 'VALIDATION_ERROR', 'email must be a valid email address');
  if (theme !== undefined && !VALID_THEMES.includes(theme)) return fail(res, 400, 'VALIDATION_ERROR', `theme must be one of: ${VALID_THEMES.join(', ')}`);
  try {
    // MySQL upsert doesn't return records — upsert then fetch
    await Settings.upsert({ userId, ...req.body });
    const record = await Settings.findOne({ where: { userId } });
    ok(res, record);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

module.exports = { get, update };
