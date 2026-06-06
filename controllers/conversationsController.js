const conversations = require('../models/conversations');
const messages = require('../models/messages');

const VALID_LANGUAGES = ['python', 'java', 'javascript'];

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = (req, res) => {
  ok(res, conversations.findAll());
};

const getById = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');

  const conversation = conversations.findById(id);
  if (!conversation) return fail(res, 404, 'NOT_FOUND', `Conversation ${id} not found`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && requesterId !== conversation.userId)
    return fail(res, 403, 'FORBIDDEN', 'Access denied');

  ok(res, { ...conversation, messages: messages.findByConversation(id) });
};

const create = (req, res) => {
  const { userId, problemId, language } = req.body;
  if (!userId || !problemId || !language)
    return fail(res, 400, 'VALIDATION_ERROR', 'userId, problemId, and language are required');
  if (!VALID_LANGUAGES.includes(language))
    return fail(res, 400, 'VALIDATION_ERROR', `language must be one of: ${VALID_LANGUAGES.join(', ')}`);

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && userId !== requesterId)
    return fail(res, 403, 'FORBIDDEN', 'Candidates can only create conversations for themselves');

  ok(res, conversations.create({ userId, problemId, language }), 201);
};

const update = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  const conversation = conversations.update(id, req.body);
  if (!conversation) return fail(res, 404, 'NOT_FOUND', `Conversation ${id} not found`);
  ok(res, conversation);
};

const remove = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  if (!conversations.remove(id)) return fail(res, 404, 'NOT_FOUND', `Conversation ${id} not found`);
  ok(res, { message: `Conversation ${id} deleted` });
};

module.exports = { getAll, getById, create, update, remove };
