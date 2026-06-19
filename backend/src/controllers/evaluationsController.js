const { Evaluation, Problem } = require('../../models/index');

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = async (req, res) => {
  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  const where = role === 'company' ? { companyId: requesterId } : {};
  try { ok(res, await Evaluation.findAll({ where })); }
  catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const getById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const evaluation = await Evaluation.findByPk(id);
    if (!evaluation) return fail(res, 404, 'NOT_FOUND', `Evaluation ${id} not found`);
    const role = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (role === 'company' && evaluation.companyId !== requesterId) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    else if (role !== 'admin' && role !== 'company' && requesterId !== evaluation.userId) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    ok(res, evaluation);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const create = async (req, res) => {
  const { userId, problemId, conversationId, score, feedback, thinkingAnalysis, dimensions } = req.body;
  if (!userId || !problemId || !conversationId || score === undefined || !feedback || !thinkingAnalysis)
    return fail(res, 400, 'VALIDATION_ERROR', 'userId, problemId, conversationId, score, feedback, and thinkingAnalysis are required');
  if (typeof score !== 'number' || score < 0 || score > 100)
    return fail(res, 400, 'VALIDATION_ERROR', 'score must be a number between 0 and 100');
  try {
    const problem = await Problem.findByPk(problemId);
    const companyId = problem ? problem.createdBy : null;
    const evaluation = await Evaluation.create({ userId, problemId, conversationId, companyId, score, feedback, thinkingAnalysis, dimensions });
    ok(res, evaluation, 201);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const update = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const evaluation = await Evaluation.findByPk(id);
    if (!evaluation) return fail(res, 404, 'NOT_FOUND', `Evaluation ${id} not found`);
    await evaluation.update(req.body);
    ok(res, evaluation);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const evaluation = await Evaluation.findByPk(id);
    if (!evaluation) return fail(res, 404, 'NOT_FOUND', `Evaluation ${id} not found`);
    await evaluation.destroy();
    ok(res, { message: `Evaluation ${id} deleted` });
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

module.exports = { getAll, getById, create, update, remove };
