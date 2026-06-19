const { Conversation, Message } = require('../../models/index');

const VALID_LANGUAGES = ['python', 'java', 'javascript'];

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = async (req, res) => {
  try { ok(res, await Conversation.findAll()); }
  catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const getById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const conversation = await Conversation.findByPk(id, { include: [{ model: Message, as: 'Messages' }] });
    if (!conversation) return fail(res, 404, 'NOT_FOUND', `Conversation ${id} not found`);
    const role = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (role !== 'admin' && requesterId !== conversation.userId) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    ok(res, conversation);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const create = async (req, res) => {
  const { userId, problemId, language } = req.body;
  if (!userId || !problemId || !language) return fail(res, 400, 'VALIDATION_ERROR', 'userId, problemId, and language are required');
  if (!VALID_LANGUAGES.includes(language)) return fail(res, 400, 'VALIDATION_ERROR', `language must be one of: ${VALID_LANGUAGES.join(', ')}`);
  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && userId !== requesterId) return fail(res, 403, 'FORBIDDEN', 'You can only create conversations for yourself');
  try {
    const conversation = await Conversation.create({ userId, problemId, language });
    ok(res, conversation, 201);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const update = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const conversation = await Conversation.findByPk(id);
    if (!conversation) return fail(res, 404, 'NOT_FOUND', `Conversation ${id} not found`);
    await conversation.update(req.body);
    ok(res, conversation);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 400, 'VALIDATION_ERROR', 'ID must be numeric');
  try {
    const conversation = await Conversation.findByPk(id);
    if (!conversation) return fail(res, 404, 'NOT_FOUND', `Conversation ${id} not found`);
    await conversation.destroy();
    ok(res, { message: `Conversation ${id} deleted` });
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

module.exports = { getAll, getById, create, update, remove };
