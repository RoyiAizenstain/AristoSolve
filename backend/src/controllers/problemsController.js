const { Problem, Progress } = require('../../models/index');
const { Op } = require('sequelize');

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_TYPES = ['algorithm', 'system-design', 'debugging'];

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = async (req, res) => {
  const { difficulty, topic, type } = req.query;
  if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) return fail(res, 400, 'VALIDATION_ERROR', `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  if (type && !VALID_TYPES.includes(type)) return fail(res, 400, 'VALIDATION_ERROR', `type must be one of: ${VALID_TYPES.join(', ')}`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  const where = {};
  if (difficulty) where.difficulty = difficulty;
  if (topic)      where.topic = topic;
  if (type)       where.type = type;

  if (role === 'candidate') {
    where.isPublic = true;
  } else if (role === 'company') {
    where[Op.or] = [{ isPublic: true }, { createdBy: requesterId }];
  }

  try { ok(res, await Problem.findAll({ where })); }
  catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const getById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const problem = await Problem.findByPk(id);
    if (!problem) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);
    const role = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (!problem.isPublic && role === 'candidate') {
      // Allow if the problem was assigned to this candidate
      const assigned = await Progress.findOne({ where: { userId: requesterId, problemId: id } });
      if (!assigned) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    }
    if (!problem.isPublic && role === 'company' && problem.createdBy !== requesterId) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    ok(res, problem);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const create = async (req, res) => {
  const { title, difficulty, topic, type, description } = req.body;
  if (!title || !difficulty || !topic || !type || !description)
    return fail(res, 400, 'VALIDATION_ERROR', 'title, difficulty, topic, type, and description are required');
  if (!VALID_DIFFICULTIES.includes(difficulty)) return fail(res, 400, 'VALIDATION_ERROR', `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  if (!VALID_TYPES.includes(type)) return fail(res, 400, 'VALIDATION_ERROR', `type must be one of: ${VALID_TYPES.join(', ')}`);
  const createdBy = parseInt(req.headers['x-user-id']);
  if (isNaN(createdBy)) return fail(res, 400, 'VALIDATION_ERROR', 'x-user-id header is required');
  try {
    const problem = await Problem.create({ ...req.body, createdBy });
    ok(res, problem, 201);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const update = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const { difficulty, type } = req.body;
  if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) return fail(res, 400, 'VALIDATION_ERROR', `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  if (type && !VALID_TYPES.includes(type)) return fail(res, 400, 'VALIDATION_ERROR', `type must be one of: ${VALID_TYPES.join(', ')}`);
  try {
    const problem = await Problem.findByPk(id);
    if (!problem) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);
    const role = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (role === 'company' && problem.createdBy !== requesterId) return fail(res, 403, 'FORBIDDEN', 'You can only edit your own problems');
    await problem.update(req.body);
    ok(res, problem);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const problem = await Problem.findByPk(id);
    if (!problem) return fail(res, 404, 'NOT_FOUND', `Problem ${id} not found`);
    const role = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (role === 'company' && problem.createdBy !== requesterId) return fail(res, 403, 'FORBIDDEN', 'You can only delete your own problems');
    await problem.destroy();
    ok(res, { message: `Problem ${id} deleted` });
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

module.exports = { getAll, getById, create, update, remove };
