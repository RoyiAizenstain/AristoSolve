const progress = require('../models/progress');

const VALID_STATUSES = ['in_progress', 'completed'];

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = (req, res) => {
  ok(res, progress.findAll());
};

const getById = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const record = progress.findById(id);
  if (!record) return fail(res, 404, 'NOT_FOUND', `Progress ${id} not found`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && requesterId !== record.userId)
    return fail(res, 403, 'FORBIDDEN', 'Access denied');

  ok(res, record);
};

const create = (req, res) => {
  const { userId, problemId, status } = req.body;
  if (!userId || !problemId || !status)
    return fail(res, 400, 'VALIDATION_ERROR', 'userId, problemId, and status are required');
  if (!VALID_STATUSES.includes(status))
    return fail(res, 400, 'VALIDATION_ERROR', `status must be one of: ${VALID_STATUSES.join(', ')}`);
  ok(res, progress.create({ userId, problemId, status, attempts: 1 }), 201);
};

const update = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const record = progress.findById(id);
  if (!record) return fail(res, 404, 'NOT_FOUND', `Progress ${id} not found`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && requesterId !== record.userId)
    return fail(res, 403, 'FORBIDDEN', 'Access denied');

  const { status } = req.body;
  if (status && !VALID_STATUSES.includes(status))
    return fail(res, 400, 'VALIDATION_ERROR', `status must be one of: ${VALID_STATUSES.join(', ')}`);

  ok(res, progress.update(id, req.body));
};

const remove = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  if (!progress.remove(id)) return fail(res, 404, 'NOT_FOUND', `Progress ${id} not found`);
  ok(res, { message: `Progress ${id} deleted` });
};

module.exports = { getAll, getById, create, update, remove };
