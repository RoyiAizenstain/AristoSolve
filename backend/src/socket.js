const { Server } = require('socket.io');
const Anthropic = require('@anthropic-ai/sdk');
const { Message, Conversation, Problem } = require('../models/index');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const buildSystemPrompt = (language, problemTitle) => `You are AristoBot, an AI mentor for a coding interview platform.
The candidate is solving "${problemTitle || 'a coding problem'}" in ${language || 'their chosen language'}.

Your dual role:
1. MENTOR — guide their thinking with Socratic questions. Never reveal the full solution.
2. SYNTAX HELPER — if they ask how to write basic ${language} syntax (loops, conditionals, functions, data structures, built-in methods), answer directly and concisely with a short code snippet.

Rules:
- For algorithm questions: guide thinking, don't solve it for them.
- For syntax/language questions: answer directly. Example: if asked "how do I write a for loop in ${language}?", show it.
- Keep replies under 4 sentences or a short code block.
- Always use ${language} syntax in examples.`;

module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ─── Event 1: candidate joins a conversation room ────────────────────
    socket.on('join-conversation', ({ conversationId }) => {
      socket.join(String(conversationId));
      console.log(`[socket] ${socket.id} joined room: ${conversationId}`);
    });

    // ─── Event 2: candidate sends a chat message ─────────────────────────
    socket.on('send-message', async ({ conversationId, content, userId, language }) => {
      try {
        // Save user message to DB
        const count = await Message.count({ where: { conversationId } });
        const userMessage = await Message.create({
          conversationId,
          sequenceNumber: count + 1,
          role: 'user',
          content,
        });

        // Broadcast user message to all OTHER clients in the room (Tab 2 demo)
        socket.to(String(conversationId)).emit('receive-message', {
          conversationId,
          message: userMessage,
        });

        // Event 3 — tell everyone in the room AristoBot is thinking
        io.to(String(conversationId)).emit('typing', { conversationId });

        // Load conversation history + problem for Claude context
        const allMessages = await Message.findAll({
          where: { conversationId },
          order: [['sequenceNumber', 'ASC']],
        });
        const conversation = await Conversation.findByPk(conversationId);
        const problem = conversation ? await Problem.findByPk(conversation.problemId) : null;

        // Build Claude message history
        const claudeMessages = allMessages.map(m => ({
          role:    m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        }));

        // Use language from event (user may have changed it), fallback to DB value
        const activeLanguage = language || conversation?.language || 'python';

        // Call Claude Haiku — fallback to canned reply if API unavailable
        let reply;
        try {
          const response = await anthropic.messages.create({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 400,
            system:     buildSystemPrompt(activeLanguage, problem?.title)
                        + (problem ? `\n\nProblem description: ${problem.description}` : ''),
            messages:   claudeMessages,
          });
          reply = response.content[0].text;
        } catch (apiErr) {
          console.error('[AristoBot] Claude API error:', apiErr.message);
          const FALLBACK = [
            "What's your first instinct when you see this problem?",
            "Good. What would be the time complexity of that approach?",
            "Can you think of a data structure that might help reduce that complexity?",
            "What edge cases should you consider here?",
            "Try to explain your approach as if I had never seen this problem.",
          ];
          const count = await Message.count({ where: { conversationId } });
          reply = FALLBACK[count % FALLBACK.length];
        }

        // Save AI reply to DB
        const newCount = await Message.count({ where: { conversationId } });
        const aiMessage = await Message.create({
          conversationId,
          sequenceNumber: newCount + 1,
          role: 'assistant',
          content: reply,
        });

        // Event 4 — broadcast reply to ALL clients in the room (enables 2-tab demo)
        io.to(String(conversationId)).emit('receive-message', {
          conversationId,
          message: aiMessage,
        });

      } catch (e) {
        console.error('[socket] send-message error:', e.message);
      }
    });

    // ─── Event 5: candidate submits — notify other tabs ──────────────────
    // endedAt + evaluation are handled by REST PUT /api/conversations/:id
    socket.on('conversation-ended', ({ conversationId }) => {
      socket.to(String(conversationId)).emit('conversation-ended', { conversationId });
      console.log(`[socket] conversation ${conversationId} ended (notified room)`);
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  return io;
};
