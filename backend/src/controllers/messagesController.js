const { Message, Conversation } = require('../../models/index');

const VALID_ROLES = ['user', 'assistant'];

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getConversation = async (req, res) => {
  const convId = parseInt(req.params.id);
  if (isNaN(convId)) { fail(res, 400, 'VALIDATION_ERROR', 'Conversation ID must be numeric'); return null; }
  const conversation = await Conversation.findByPk(convId);
  if (!conversation) { fail(res, 404, 'NOT_FOUND', `Conversation ${convId} not found`); return null; }
  return conversation;
};

const getAll = async (req, res) => {
  try {
    const conversation = await getConversation(req, res);
    if (!conversation) return;
    const role = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (role !== 'admin' && requesterId !== conversation.userId) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    ok(res, await Message.findAll({ where: { conversationId: conversation.id }, order: [['sequenceNumber', 'ASC']] }));
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const create = async (req, res) => {
  try {
    const conversation = await getConversation(req, res);
    if (!conversation) return;
    const userRole = req.headers['x-user-role'];
    const requesterId = parseInt(req.headers['x-user-id']);
    if (userRole !== 'admin' && requesterId !== conversation.userId) return fail(res, 403, 'FORBIDDEN', 'Access denied');
    const { role, content } = req.body;
    if (!role || !content) return fail(res, 400, 'VALIDATION_ERROR', 'role and content are required');
    if (!VALID_ROLES.includes(role)) return fail(res, 400, 'VALIDATION_ERROR', `role must be one of: ${VALID_ROLES.join(', ')}`);
    const count = await Message.count({ where: { conversationId: conversation.id } });
    const message = await Message.create({ conversationId: conversation.id, sequenceNumber: count + 1, role, content });
    ok(res, message, 201);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const update = async (req, res) => {
  try {
    const conversation = await getConversation(req, res);
    if (!conversation) return;
    const msgId = parseInt(req.params.msgId);
    if (isNaN(msgId)) return fail(res, 400, 'VALIDATION_ERROR', 'Message ID must be numeric');
    const message = await Message.findOne({ where: { id: msgId, conversationId: conversation.id } });
    if (!message) return fail(res, 404, 'NOT_FOUND', `Message ${msgId} not found`);
    await message.update(req.body);
    ok(res, message);
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

const remove = async (req, res) => {
  try {
    const conversation = await getConversation(req, res);
    if (!conversation) return;
    const msgId = parseInt(req.params.msgId);
    if (isNaN(msgId)) return fail(res, 400, 'VALIDATION_ERROR', 'Message ID must be numeric');
    const message = await Message.findOne({ where: { id: msgId, conversationId: conversation.id } });
    if (!message) return fail(res, 404, 'NOT_FOUND', `Message ${msgId} not found`);
    await message.destroy();
    ok(res, { message: `Message ${msgId} deleted` });
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
};

module.exports = { getAll, create, update, remove };
