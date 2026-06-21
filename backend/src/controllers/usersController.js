const { User } = require('../../models/index');

const VALID_ROLES  = ['admin', 'company', 'candidate'];
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = async (req, res) => {
  try { ok(res, await User.findAll({ attributes: { exclude: ['password'] } })); }
  catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const getMe = async (req, res) => {
  const id = parseInt(req.headers['x-user-id']);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'x-user-id header required');
  try {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found');
    ok(res, user);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const getById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && requesterId !== id) return fail(res, 403, 'FORBIDDEN', 'Access denied');
  try {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) return fail(res, 404, 'NOT_FOUND', `User ${id} not found`);
    ok(res, user);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const create = async (req, res) => {
  const { firstName, lastName, email, password, userRole, level } = req.body;
  if (!firstName || !lastName || !email || !password || !userRole)
    return fail(res, 400, 'VALIDATION_ERROR', 'firstName, lastName, email, password, and userRole are required');
  if (!VALID_ROLES.includes(userRole))
    return fail(res, 400, 'VALIDATION_ERROR', `userRole must be one of: ${VALID_ROLES.join(', ')}`);
  if (level && !VALID_LEVELS.includes(level))
    return fail(res, 400, 'VALIDATION_ERROR', `level must be one of: ${VALID_LEVELS.join(', ')}`);
  try {
    const user = await User.create({ firstName, lastName, email, password, userRole, level: level || 'beginner' });
    const { password: _, ...safe } = user.toJSON();
    ok(res, safe, 201);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return fail(res, 400, 'VALIDATION_ERROR', 'Email already in use');
    fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

const update = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && requesterId !== id) return fail(res, 403, 'FORBIDDEN', 'Access denied');
  const { userRole, level } = req.body;
  if (userRole && !VALID_ROLES.includes(userRole)) return fail(res, 400, 'VALIDATION_ERROR', `userRole must be one of: ${VALID_ROLES.join(', ')}`);
  if (level && !VALID_LEVELS.includes(level)) return fail(res, 400, 'VALIDATION_ERROR', `level must be one of: ${VALID_LEVELS.join(', ')}`);
  try {
    const user = await User.findByPk(id);
    if (!user) return fail(res, 404, 'NOT_FOUND', `User ${id} not found`);
    const updates = { ...req.body };
    if (!updates.password) delete updates.password; // never overwrite with empty string
    await user.update(updates);
    const { password: _, ...safe } = user.toJSON();
    ok(res, safe);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const adminCount = await User.count({ where: { userRole: 'admin' } });
    const target = await User.findByPk(id);
    if (!target) return fail(res, 404, 'NOT_FOUND', `User ${id} not found`);
    if (target.userRole === 'admin' && adminCount <= 1)
      return fail(res, 400, 'VALIDATION_ERROR', 'Cannot delete the last admin account');
    await target.destroy();
    ok(res, { message: `User ${id} deleted` });
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

module.exports = { getAll, getMe, getById, create, update, remove };
