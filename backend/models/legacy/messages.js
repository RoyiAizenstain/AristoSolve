let messages = [
  { id: 1, conversationId: 1, sequenceNumber: 1, role: 'user', content: 'I think I should use a nested loop to check all pairs.', createdAt: '2024-02-01T10:05:00Z' },
  { id: 2, conversationId: 1, sequenceNumber: 2, role: 'assistant', content: 'That would work! What would be the time complexity of that approach?', createdAt: '2024-02-01T10:06:00Z' },
  { id: 3, conversationId: 1, sequenceNumber: 3, role: 'user', content: 'O(n^2). Is there a faster way?', createdAt: '2024-02-01T10:08:00Z' },
  { id: 4, conversationId: 1, sequenceNumber: 4, role: 'assistant', content: 'Think about what data structure lets you look up a value in O(1) time.', createdAt: '2024-02-01T10:09:00Z' },
  { id: 5, conversationId: 2, sequenceNumber: 1, role: 'user', content: 'I could sort each string and use the sorted version as a hash map key.', createdAt: '2024-02-02T14:05:00Z' },
  { id: 6, conversationId: 2, sequenceNumber: 2, role: 'assistant', content: 'Great thinking! What would be the time complexity of sorting each string?', createdAt: '2024-02-02T14:06:00Z' },
  { id: 7, conversationId: 3, sequenceNumber: 1, role: 'user', content: 'Can I use a HashMap to store visited numbers?', createdAt: '2024-02-03T09:05:00Z' },
  { id: 8, conversationId: 3, sequenceNumber: 2, role: 'assistant', content: 'Absolutely. What would you store as the key and value?', createdAt: '2024-02-03T09:06:00Z' },
];
let nextId = 9;

const findAll = () => messages;
const findById = (id) => messages.find(m => m.id === id);
const findByConversation = (conversationId) => messages.filter(m => m.conversationId === conversationId);

const create = (data) => {
  const sequenceNumber = messages.filter(m => m.conversationId === data.conversationId).length + 1;
  const message = { id: nextId++, ...data, sequenceNumber, createdAt: new Date().toISOString() };
  messages.push(message);
  return message;
};

const update = (id, data) => {
  const idx = messages.findIndex(m => m.id === id);
  if (idx === -1) return null;
  messages[idx] = { ...messages[idx], ...data };
  return messages[idx];
};

const remove = (id) => {
  const idx = messages.findIndex(m => m.id === id);
  if (idx === -1) return false;
  messages.splice(idx, 1);
  return true;
};

module.exports = { findAll, findById, findByConversation, create, update, remove };
