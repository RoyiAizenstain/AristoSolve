const messages = require('../models/messages');
const conversations = require('../models/conversations');

const VALID_ROLES = ['user', 'assistant'];

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getConversationOr404 = (req, res) => {
  const convId = parseInt(req.params.id);
  if (isNaN(convId)) { fail(res, 400, 'VALIDATION_ERROR', 'Conversation ID must be numeric'); return null; }
  const conversation = conversations.findById(convId);
  if (!conversation) { fail(res, 404, 'NOT_FOUND', `Conversation ${convId} not found`); return null; }
  return conversation;
};

const getAll = (req, res) => {
  const conversation = getConversationOr404(req, res);
  if (!conversation) return;

  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role !== 'admin' && requesterId !== conversation.userId)
    return fail(res, 403, 'FORBIDDEN', 'Access denied');

  ok(res, messages.findByConversation(conversation.id));
};

const create = (req, res) => {
  const conversation = getConversationOr404(req, res);
  if (!conversation) return;

  const { role, content } = req.body;
  if (!role || !content)
    return fail(res, 400, 'VALIDATION_ERROR', 'role and content are required');
  if (!VALID_ROLES.includes(role))
    return fail(res, 400, 'VALIDATION_ERROR', `role must be one of: ${VALID_ROLES.join(', ')}`);

  ok(res, messages.create({ conversationId: conversation.id, role, content }), 201);
};

const update = (req, res) => {
  const conversation = getConversationOr404(req, res);
  if (!conversation) return;

  const msgId = parseInt(req.params.msgId);
  if (isNaN(msgId)) return fail(res, 400, 'VALIDATION_ERROR', 'Message ID must be numeric');

  const message = messages.findById(msgId);
  if (!message || message.conversationId !== conversation.id)
    return fail(res, 404, 'NOT_FOUND', `Message ${msgId} not found`);

  ok(res, messages.update(msgId, req.body));
};

const remove = (req, res) => {
  const conversation = getConversationOr404(req, res);
  if (!conversation) return;

  const msgId = parseInt(req.params.msgId);
  if (isNaN(msgId)) return fail(res, 400, 'VALIDATION_ERROR', 'Message ID must be numeric');

  const message = messages.findById(msgId);
  if (!message || message.conversationId !== conversation.id)
    return fail(res, 404, 'NOT_FOUND', `Message ${msgId} not found`);

  messages.remove(msgId);
  ok(res, { message: `Message ${msgId} deleted` });
};

module.exports = { getAll, create, update, remove };
