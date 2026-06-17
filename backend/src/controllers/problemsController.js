const problems = require('../../models/legacy/problems');

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_TYPES = ['algorithm', 'system-design', 'debugging'];

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = (req, res) => {
  const { difficulty, topic, type } = req.query;
  if (difficulty && !VALID_DIFFICULTIES.includes(difficulty))
    return fail(res, 400, 'VALIDATION_ERROR', `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  if (type && !VALID_TYPES.includes(type))
    return fail(res, 400, 'VALIDATION_ERROR', `type must be one of: ${VALID_TYPES.join(', ')}`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  let all = problems.findAll({ difficulty, topic, type });

  if (role === 'candidate') {
    all = all.filter(p => p.isPublic);
  } else if (role === 'company') {
    all = all.filter(p => p.isPublic || p.createdBy === requesterId);
  }
  // admin sees everything

  ok(res, all);
};

const getById = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const problem = problems.findById(id);
  if (!problem) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (!problem.isPublic && role === 'candidate')
    return fail(res, 403, 'FORBIDDEN', 'Access denied');
  if (!problem.isPublic && role === 'company' && problem.createdBy !== requesterId)
    return fail(res, 403, 'FORBIDDEN', 'Access denied');

  ok(res, problem);
};

const create = (req, res) => {
  const { title, difficulty, topic, type, description } = req.body;
  if (!title || !difficulty || !topic || !type || !description)
    return fail(res, 400, 'VALIDATION_ERROR', 'title, difficulty, topic, type, and description are required');
  if (!VALID_DIFFICULTIES.includes(difficulty))
    return fail(res, 400, 'VALIDATION_ERROR', `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  if (!VALID_TYPES.includes(type))
    return fail(res, 400, 'VALIDATION_ERROR', `type must be one of: ${VALID_TYPES.join(', ')}`);

  const createdBy = parseInt(req.headers['x-user-id']);
  if (isNaN(createdBy))
    return fail(res, 400, 'VALIDATION_ERROR', 'x-user-id header is required to identify the creator');

  const problem = problems.create({ ...req.body, createdBy });
  ok(res, problem, 201);
};

const update = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const problem = problems.findById(id);
  if (!problem) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role === 'company' && problem.createdBy !== requesterId)
    return fail(res, 403, 'FORBIDDEN', 'You can only edit your own problems');

  const { difficulty, type } = req.body;
  if (difficulty && !VALID_DIFFICULTIES.includes(difficulty))
    return fail(res, 400, 'VALIDATION_ERROR', `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  if (type && !VALID_TYPES.includes(type))
    return fail(res, 400, 'VALIDATION_ERROR', `type must be one of: ${VALID_TYPES.join(', ')}`);

  ok(res, problems.update(id, req.body));
};

const remove = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const problem = problems.findById(id);
  if (!problem) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role === 'company' && problem.createdBy !== requesterId)
    return fail(res, 403, 'FORBIDDEN', 'You can only delete your own problems');

  problems.remove(id);
  ok(res, { message: `Problem ${id} deleted` });
};

module.exports = { getAll, getById, create, update, remove };
