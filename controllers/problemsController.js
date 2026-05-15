const problems = require('../models/problems');

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
  ok(res, problems.findAll({ difficulty, topic, type }));
};

const getById = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const problem = problems.findById(id);
  if (!problem) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);
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
  const { difficulty, type } = req.body;
  if (difficulty && !VALID_DIFFICULTIES.includes(difficulty))
    return fail(res, 400, 'VALIDATION_ERROR', `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  if (type && !VALID_TYPES.includes(type))
    return fail(res, 400, 'VALIDATION_ERROR', `type must be one of: ${VALID_TYPES.join(', ')}`);
  const problem = problems.update(id, req.body);
  if (!problem) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);
  ok(res, problem);
};

const remove = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const deleted = problems.remove(id);
  if (!deleted) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);
  ok(res, { message: `Problem ${id} deleted` });
};

module.exports = { getAll, getById, create, update, remove };
