const users = require('../../models/legacy/users');

const VALID_ROLES = ['admin', 'company', 'candidate'];
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = (req, res) => {
  ok(res, users.findAll());
};

const getMe = (req, res) => {
  const requesterId = parseInt(req.headers['x-user-id']);
  if (isNaN(requesterId)) return fail(res, 400, 'VALIDATION_ERROR', 'x-user-id header is required');

  const user = users.findById(requesterId);
  if (!user) return fail(res, 404, 'NOT_FOUND', `User ${requesterId} not found`);
  const { password, ...safe } = user;
  ok(res, safe);
};

const getById = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);

  if (role !== 'admin' && requesterId !== id) {
    return fail(res, 403, 'FORBIDDEN', 'Access denied');
  }

  const user = users.findById(id);
  if (!user) return fail(res, 404, 'NOT_FOUND', `User ${id} not found`);
  ok(res, user);
};

const create = (req, res) => {
  const { firstName, lastName, email, password, userRole, level } = req.body;

  if (!firstName || !lastName || !email || !password || !userRole) {
    return fail(res, 400, 'VALIDATION_ERROR', 'firstName, lastName, email, password, and userRole are required');
  }
  if (!VALID_ROLES.includes(userRole)) {
    return fail(res, 400, 'VALIDATION_ERROR', `userRole must be one of: ${VALID_ROLES.join(', ')}`);
  }
  if (level && !VALID_LEVELS.includes(level)) {
    return fail(res, 400, 'VALIDATION_ERROR', `level must be one of: ${VALID_LEVELS.join(', ')}`);
  }

  const user = users.create({ firstName, lastName, email, password, userRole, level: level || 'beginner' });
  ok(res, user, 201);
};

const update = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);

  if (role !== 'admin' && requesterId !== id) {
    return fail(res, 403, 'FORBIDDEN', 'Access denied');
  }

  const { userRole, level } = req.body;
  if (userRole && !VALID_ROLES.includes(userRole)) {
    return fail(res, 400, 'VALIDATION_ERROR', `userRole must be one of: ${VALID_ROLES.join(', ')}`);
  }
  if (level && !VALID_LEVELS.includes(level)) {
    return fail(res, 400, 'VALIDATION_ERROR', `level must be one of: ${VALID_LEVELS.join(', ')}`);
  }

  const user = users.update(id, req.body);
  if (!user) return fail(res, 404, 'NOT_FOUND', `User ${id} not found`);
  ok(res, user);
};

const remove = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const requesterId = parseInt(req.headers['x-user-id']);
  if (id === requesterId) {
    const adminCount = users.findAll().filter(u => u.userRole === 'admin').length;
    if (adminCount <= 1)
      return fail(res, 403, 'FORBIDDEN', 'Cannot delete the last admin account');
  }

  const deleted = users.remove(id);
  if (!deleted) return fail(res, 404, 'NOT_FOUND', `User ${id} not found`);
  ok(res, { message: `User ${id} deleted` });
};

module.exports = { getAll, getMe, getById, create, update, remove };
