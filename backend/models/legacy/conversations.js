let conversations = [
  { id: 1, userId: 3, problemId: 1, language: 'javascript', startedAt: '2024-02-01T10:00:00Z', endedAt: '2024-02-01T10:45:00Z' },
  { id: 2, userId: 3, problemId: 2, language: 'python', startedAt: '2024-02-02T14:00:00Z', endedAt: null },
  { id: 3, userId: 4, problemId: 1, language: 'java', startedAt: '2024-02-03T09:00:00Z', endedAt: '2024-02-03T09:30:00Z' },
  { id: 4, userId: 5, problemId: 3, language: 'python', startedAt: '2024-02-04T11:00:00Z', endedAt: null },
  { id: 5, userId: 4, problemId: 3, language: 'javascript', startedAt: '2024-02-06T15:00:00Z', endedAt: '2024-02-06T15:50:00Z' },
];
let nextId = 6;

const findAll = () => conversations;
const findById = (id) => conversations.find(c => c.id === id);

const create = (data) => {
  const conversation = { id: nextId++, ...data, startedAt: new Date().toISOString(), endedAt: null };
  conversations.push(conversation);
  return conversation;
};

const update = (id, data) => {
  const idx = conversations.findIndex(c => c.id === id);
  if (idx === -1) return null;
  conversations[idx] = { ...conversations[idx], ...data };
  return conversations[idx];
};

const remove = (id) => {
  const idx = conversations.findIndex(c => c.id === id);
  if (idx === -1) return false;
  conversations.splice(idx, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
