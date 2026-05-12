const evaluations = require('../models/evaluations');

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = (req, res) => {
  ok(res, evaluations.findAll());
};

const getById = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const evaluation = evaluations.findById(id);
  if (!evaluation) return fail(res, 404, 'NOT_FOUND', `Evaluation ${id} not found`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && role !== 'company' && requesterId !== evaluation.userId)
    return fail(res, 403, 'FORBIDDEN', 'Access denied');

  ok(res, evaluation);
};

const create = (req, res) => {
  const { userId, problemId, conversationId, score, feedback, thinkingAnalysis } = req.body;
  if (!userId || !problemId || !conversationId || score === undefined || !feedback || !thinkingAnalysis)
    return fail(res, 400, 'VALIDATION_ERROR', 'userId, problemId, conversationId, score, feedback, and thinkingAnalysis are required');
  if (typeof score !== 'number' || score < 0 || score > 100)
    return fail(res, 400, 'VALIDATION_ERROR', 'score must be a number between 0 and 100');
  ok(res, evaluations.create(req.body), 201);
};

const update = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const evaluation = evaluations.update(id, req.body);
  if (!evaluation) return fail(res, 404, 'NOT_FOUND', `Evaluation ${id} not found`);
  ok(res, evaluation);
};

const remove = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  if (!evaluations.remove(id)) return fail(res, 404, 'NOT_FOUND', `Evaluation ${id} not found`);
  ok(res, { message: `Evaluation ${id} deleted` });
};

module.exports = { getAll, getById, create, update, remove };
