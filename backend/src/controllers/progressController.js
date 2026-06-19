const { Progress, Problem, User } = require('../../models/index');

const VALID_STATUSES = ['in_progress', 'completed'];

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = async (req, res) => {
  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  const where = role === 'candidate' ? { userId: requesterId } : {};
  try {
    // JOIN query: Progress + User + Problem (satisfies A4 relational query requirement)
    const records = await Progress.findAll({
      where,
      include: [
        { model: User,    attributes: ['userId', 'firstName', 'lastName', 'email'] },
        { model: Problem, attributes: ['id', 'title', 'difficulty', 'topic'] },
      ],
    });
    ok(res, records);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const getById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const record = await Progress.findByPk(id, {
      include: [
        { model: User,    attributes: ['userId', 'firstName', 'lastName'] },
        { model: Problem, attributes: ['id', 'title', 'difficulty'] },
      ],
    });
    if (!record) return fail(res, 404, 'NOT_FOUND', `Progress ${id} not found`);
    const role = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (role !== 'admin' && requesterId !== record.userId) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    ok(res, record);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const create = async (req, res) => {
  const { userId, problemId, status, deadline } = req.body;
  if (!userId || !problemId || !status) return fail(res, 400, 'VALIDATION_ERROR', 'userId, problemId, and status are required');
  if (!VALID_STATUSES.includes(status)) return fail(res, 400, 'VALIDATION_ERROR', `status must be one of: ${VALID_STATUSES.join(', ')}`);
  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  // candidates can only create for themselves; company/admin can assign to any candidate
  if (role === 'candidate' && userId !== requesterId) return fail(res, 403, 'FORBIDDEN', 'Candidates can only create progress for themselves');
  try {
    const record = await Progress.create({ userId, problemId, status, attempts: 1, deadline: deadline || null });
    ok(res, record, 201);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const update = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const { status } = req.body;
  if (status && !VALID_STATUSES.includes(status)) return fail(res, 400, 'VALIDATION_ERROR', `status must be one of: ${VALID_STATUSES.join(', ')}`);
  try {
    const record = await Progress.findByPk(id);
    if (!record) return fail(res, 404, 'NOT_FOUND', `Progress ${id} not found`);
    const role = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (role !== 'admin' && requesterId !== record.userId) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    await record.update(req.body);
    ok(res, record);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const record = await Progress.findByPk(id);
    if (!record) return fail(res, 404, 'NOT_FOUND', `Progress ${id} not found`);
    await record.destroy();
    ok(res, { message: `Progress ${id} deleted` });
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

module.exports = { getAll, getById, create, update, remove };
