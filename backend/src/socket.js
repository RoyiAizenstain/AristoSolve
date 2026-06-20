const { Server } = require('socket.io');
const { Message, Conversation } = require('../models/index');

const MENTOR_REPLIES = [
  "What's your first instinct when you see this problem?",
  "Good. What would be the time complexity of that approach?",
  "Can you think of a data structure that might help reduce that complexity?",
  "What edge cases should you consider here?",
  "How would your solution handle an empty input?",
  "You're thinking in the right direction. What's the space complexity?",
  "Try to explain your approach as if I had never seen this problem.",
  "What would happen if all elements in the array are the same?",
];

// Track reply index per conversation so replies cycle in order
const replyIndex = {};

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
    socket.on('send-message', async ({ conversationId, content, userId }) => {
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

        // Pick next canned reply based on actual message count in DB
        // (Part 3 replaces this with real Claude API)
        const totalMessages = await Message.count({ where: { conversationId } });
        const reply = MENTOR_REPLIES[totalMessages % MENTOR_REPLIES.length];

        // Small delay so typing indicator is visible
        await new Promise(r => setTimeout(r, 1000));

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

    // ─── Event 5: candidate submits / ends the conversation ──────────────
    socket.on('conversation-ended', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findByPk(conversationId);
        if (conversation && !conversation.endedAt) {
          await conversation.update({ endedAt: new Date() });
          console.log(`[socket] conversation ${conversationId} ended`);
        }
      } catch (e) {
        console.error('[socket] conversation-ended error:', e.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  return io;
};
