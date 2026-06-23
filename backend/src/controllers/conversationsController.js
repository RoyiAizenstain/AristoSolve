const Anthropic = require('@anthropic-ai/sdk');
const { Conversation, Message, Problem, Evaluation, Progress } = require('../../models/index');
const { Op } = require('sequelize');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EVAL_SYSTEM_PROMPT = `You are evaluating a technical interview on an AI-guided coding platform.
The conversation includes the candidate's chat with an AI mentor AND their final code submission (marked as [Final submission]).

Score the candidate on two main areas:

1. AI NATIVENESS — how well they think alongside AI:
- prompting: did they ask clear, focused questions to the AI?
- criticalThinking: did they push back or reason independently rather than just accepting AI hints?
- adaptability: did they recover and redirect when they went down wrong paths?

2. CODE QUALITY — evaluate the final submitted code:
- codeCorrectness: is the logic correct? Does it handle edge cases? Is the approach efficient?
  Look at the [Final submission] block at the end of the conversation.

Return ONLY valid JSON in this exact shape:
{
  "score": <overall 0-100, weighted: 50% AI nativeness + 50% code quality>,
  "feedback": "<2-3 sentence overall assessment covering both thinking process and code quality>",
  "thinkingAnalysis": "<2-3 sentence analysis of how they interacted with the AI mentor>",
  "codeAnalysis": "<1-2 sentence assessment of the submitted code's correctness and efficiency>",
  "dimensions": {
    "prompting": <0-100>,
    "criticalThinking": <0-100>,
    "adaptability": <0-100>,
    "codeCorrectness": <0-100>
  }
}`;

const VALID_LANGUAGES = ['python', 'java', 'javascript'];

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message, details: {} } });

const getAll = async (req, res) => {
  const role        = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  const { problemId } = req.query;

  try {
    // Candidate/company: return their own conversations, optionally filtered by problem
    if (role !== 'admin') {
      const where = { userId: requesterId };
      if (problemId) where.problemId = parseInt(problemId);
      const conversations = await Conversation.findAll({
        where,
        include: [{ model: Message, as: 'Messages', order: [['sequenceNumber', 'ASC']] }],
        order: [['startedAt', 'DESC']],
      });
      return ok(res, conversations);
    }
    // Admin: return all
    ok(res, await Conversation.findAll());
  } catch (e) { fail(res, 500, 'INTERNAL_ERROR', e.message); }
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
    const wasAlreadyEnded = !!conversation.endedAt;
    await conversation.update(req.body);

    // Auto-create AI evaluation — only for company-assigned problems
    if (req.body.endedAt && !wasAlreadyEnded) {
      const problem  = await Problem.findByPk(conversation.problemId);
      const existing = await Evaluation.findOne({ where: { conversationId: id } });

      // Check if this problem was assigned by a company (progress record with deadline)
      const assignment = await Progress.findOne({
        where: {
          userId:    conversation.userId,
          problemId: conversation.problemId,
          deadline:  { [Op.ne]: null },
        },
      });

      if (!existing && problem && assignment) {
        try {
          // Load full conversation history
          const messages = await Message.findAll({
            where: { conversationId: id },
            order: [['sequenceNumber', 'ASC']],
          });

          const claudeMessages = messages.map(m => ({
            role:    m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          }));

          // Call Claude Haiku to evaluate
          const evalPromptNote = problem.evalPrompt
            ? `\n\nCompany evaluation focus: ${problem.evalPrompt}`
            : '';

          const response = await anthropic.messages.create({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 600,
            system:     EVAL_SYSTEM_PROMPT + evalPromptNote,
            messages:   claudeMessages,
          });

          const raw = response.content[0].text;
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

          await Evaluation.create({
            userId:           conversation.userId,
            problemId:        conversation.problemId,
            conversationId:   id,
            companyId:        problem.createdBy,
            score:            result?.score ?? null,
            feedback:         result?.feedback ?? 'Evaluation generated.',
            thinkingAnalysis: result?.thinkingAnalysis ?? '',
            dimensions:       {
              ...result?.dimensions,
              codeAnalysis: result?.codeAnalysis ?? '',
            } ?? null,
          });
        } catch (evalErr) {
          console.error('[eval] Claude evaluation failed:', evalErr.message);
          // Fallback placeholder so the evaluation row still exists
          await Evaluation.create({
            userId:           conversation.userId,
            problemId:        conversation.problemId,
            conversationId:   id,
            companyId:        problem.createdBy,
            score:            null,
            feedback:         'Evaluation could not be generated.',
            thinkingAnalysis: '',
            dimensions:       null,
          });
        }
      }
    }

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
